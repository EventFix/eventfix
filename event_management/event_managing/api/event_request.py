import frappe

def set_project_creator(doc, method):
    full_name = frappe.session.user
    frappe.errprint(f"full name {full_name}")
    doc.custom_project_creator = full_name
