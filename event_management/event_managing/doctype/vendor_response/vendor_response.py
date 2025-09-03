# Copyright (c) 2025, Owais Khan and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document


class VendorResponse(Document):
	def after_insert(self):
        # Automatically sync to Sourcing Request when Vendor Response is created
		if not self.sourcing_request:
			return
		
		try:
			sr = frappe.get_doc("Sourcing Request", self.sourcing_request)
			row = sr.append("vendor_response", {})
			row.vendor = self.vendor
			row.quoted_amount = self.quoted_amount
			row.comments = self.comments
			if hasattr(self, "attachment"):
				row.attachment = self.attachment
			sr.save(ignore_permissions=True)
            
		except frappe.DoesNotExistError:
			frappe.log_error(f"Sourcing Request not found for Vendor Response {self.name}")