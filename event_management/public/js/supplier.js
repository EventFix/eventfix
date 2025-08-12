frappe.ui.form.on('Supplier', {
	refresh(frm) {
        // Clear existing Create menu items if you want a clean menu
        frm.page.clear_inner_toolbar();
        
        // Add new item to Create dropdown
        frm.page.add_inner_button(__('Bank Account'), () => {
            frappe.new_doc('Bank Account', {
                party: frm.doc.supplier_name  // Link it to current Customer Inquiry
            });
        }, __('Create'));  // 'Create' is the dropdown group name
	}
})