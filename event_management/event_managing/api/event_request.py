import frappe

def set_project_creator(doc, method):
    if not doc.custom_project_creator:
        full_name = frappe.session.user
        print(full_name)
        doc.custom_project_creator = full_name
