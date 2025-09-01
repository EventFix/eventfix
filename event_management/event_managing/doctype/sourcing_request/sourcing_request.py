# Copyright (c) 2025, Owais Khan and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document

class SourcingRequest(Document):
	pass

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