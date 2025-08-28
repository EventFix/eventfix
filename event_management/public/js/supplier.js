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
	},

    onload(frm) {
    // Only show top-level categories for Vendor Type
    frm.set_query('custom_vendor_category', function() {
      return { filters: { is_group: 1 } };
    });

    // Sub-Category must be a child of Vendor Type
    frm.set_query('custom_subcategory', function() {
      if (!frm.doc.custom_vendor_category) {
        // prevent showing everything when parent is empty
        return { filters: { name: "__none" } };
      }
      return {
        filters: {
          parent_vendor_category: frm.doc.custom_vendor_category, // auto-created by Tree doctype
          is_group: 0
        }
      };
    });
  },

  vendor_type(frm) {
    // when changing parent, clear old child and reapply filter
    frm.set_value('custom_subcategory', null);
    frm.trigger('onload');
  }
})