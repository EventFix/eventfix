# Copyright (c) 2025, Owais Khan and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document
from frappe.utils import now_datetime
from urllib.parse import quote

class SourcingRequest(Document):
	pass

# code for sub-category based on vendor-category
@frappe.whitelist()
def get_items_by_vendor_category(category):
    """Return items grouped by child item-groups under a selected parent category."""
    if not category:
        return []

    # 1) all child groups (leaf groups) under the selected parent
    child_groups = frappe.get_all(
        "Item Group",
        filters={"parent_item_group": category, "is_group": 0},
        pluck="name"
    )

    result = []
    for group in child_groups:
        items = frappe.get_all(
            "Item",
            filters={"item_group": group, "disabled": 0},
            fields=["name as item_code", "item_name", "item_group"]
        )
        result.append({
            "child_group": group,
            "items": items
        })

    return result

# Code for Send email
def _ensure_vendor_tokens(doc):
    # Generate a unique token for each assigned vendor if missing."""
    updated = False
    for row in (doc.assigned_vendors or []):
        if not row.token:
            row.token = frappe.generate_hash(length=20)
            updated = True
    if updated:
        doc.save(ignore_permissions=True)

@frappe.whitelist()
def generate_vendor_links(name):
    # Return list of vendor rows with public response links (and ensure tokens).
    doc = frappe.get_doc("Sourcing Request", name)
    _ensure_vendor_tokens(doc)

    base_url = frappe.utils.get_url()  
    links = []
    for row in doc.assigned_vendors:
        if not row.vendor:
            continue
        url = f"{base_url}/vendor-response?sr={quote(doc.name)}&vendor={quote(row.vendor)}&t={quote(row.token)}"
        links.append({
            "vendor": row.vendor,
            "email": row.email,
            "url": url
        })
    return links

@frappe.whitelist()
def send_rfq_emails(name):
    # Send RFQ emails to each assigned vendor with their unique link.
    doc = frappe.get_doc("Sourcing Request", name)
    links = generate_vendor_links(name)  

    # items assumed on child table "items" with item_code, item_name, qty
    item_lines = []
    for it in (doc.items or []):
        item_lines.append(f"- {it.item_name or it.item_code} (Qty: {it.qty})")
    items_text = "\n".join(item_lines) if item_lines else "- No items -"

    for row in doc.assigned_vendors:
        if not row.email:
            continue

        # find the link for this vendor
        link = next((l["url"] for l in links if l["vendor"] == row.vendor), None)
        if not link:
            continue

        subject = f"Sourcing Request {doc.name}"
        message = f"""
Hello,

You have been invited to quote for sourcing request <b>{doc.name}</b>.
<br>
<b>Items:</b><br>
<pre style="font-size:13px">{frappe.utils.escape_html(items_text)}</pre>

Please submit your quote and upload documents using this secure link:
<br>
<a href="{link}">{link}</a>
<br>
Regards,<br>

"""
# {frappe.utils.get_fullname(frappe.session.user)} below regards
        frappe.sendmail(
            recipients=[row.email],
            subject=subject,
            message=message
        )

        # Update only the child row 
        frappe.db.set_value(
            "Sourcing Request Vendor",  
            row.name,  
            {
                "email_send_on": now_datetime(),
                "status": "Sent"
            }
        )

    # doc.save(ignore_permissions=True)
    return {"sent": True, "count": len(doc.assigned_vendors or [])}

@frappe.whitelist(allow_guest=True)
def validate_vendor_link(sr, vendor, token):
    # Validate that this vendor+token belongs to SR.
    if not (sr and vendor and token):
        return False
    try:
        doc = frappe.get_doc("Sourcing Request", sr)
    except frappe.DoesNotExistError:
        return False

    for row in (doc.assigned_vendors or []):
        if row.vendor == vendor and row.token == token:
            return True
    return False