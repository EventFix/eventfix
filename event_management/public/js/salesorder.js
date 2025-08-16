frappe.ui.form.on('Sales Order', {
    refresh(frm) {
        if (frm.doc.docstatus !== 1) return; // only after submission
        
        // frm.page.add_inner_button(__('Vendor'), () => {
        //     frappe.new_doc('Purchase Invoice', {
        //        // party: frm.doc.supplier_name  // Link it to current Customer Inquiry
        //     });
        // }, __('Pay'));

        const keepItems = ["Project","Payment Request", "Payment"];

        // Function to filter the Create dropdown
        const filterCreateMenu = (tries = 0) => {
            const $createMenu = frm.page.wrapper.find('.inner-group-button[data-label="Create"] .dropdown-menu');

            if ($createMenu.length) {
                $createMenu.find('a.dropdown-item').each(function () {
                    const label = $(this).attr('data-label') || $(this).text().trim();
                    if (!keepItems.includes(label)) {
                        $(this).remove();
                    }
                });
            } else if (tries < 20) {
                // Retry in case menu is rendered late
                setTimeout(() => filterCreateMenu(tries + 1), 100);
            }
        };

        frappe.after_ajax(() => filterCreateMenu());
    }
});
