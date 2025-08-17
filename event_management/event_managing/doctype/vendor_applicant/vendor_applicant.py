# Copyright (c) 2025, Owais Khan and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document

class VendorApplicant(Document):
    def on_update(self):
        if self.status == "Approved" and not frappe.db.exists("Supplier", {"supplier_name": self.vendor_name}):
            supplier = frappe.get_doc({
                "doctype": "Supplier",
                "supplier_name": self.vendor_name,
                "custom_categories": self.category,
                "email_id": self.contact_email,
                "mobile_no": self.mobile_number,
            })
            supplier.insert(ignore_permissions=True)
            frappe.msgprint(f"Vendor {supplier.name} created successfully.")