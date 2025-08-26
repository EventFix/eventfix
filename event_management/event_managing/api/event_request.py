import frappe

def set_project_creator(doc, method):
    full_name = frappe.session.user_fullname
    doc.custom_project_creator = full_name
