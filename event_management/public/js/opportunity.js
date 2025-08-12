frappe.ui.form.on('Opportunity', {
    refresh(frm) {
        // Clear existing Create menu items if you want a clean menu
        frm.page.clear_inner_toolbar();

        // Add new item to Create dropdown
        frm.page.add_inner_button(__('Sourcing Request'), () => {
            frappe.new_doc('Sourcing Request', {
                inquiry: frm.doc.name  // Link it to current Customer Inquiry
            });
        }, __('Create'));  // 'Create' is the dropdown group name
    }
});