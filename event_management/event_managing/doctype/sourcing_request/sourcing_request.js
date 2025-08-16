// Copyright (c) 2025, Owais Khan and contributors
// For license information, please see license.txt

frappe.ui.form.on("Sourcing Request", {
	refresh(frm) {
         // Check if at least one accepted vendor exists
        let accepted_vendors = frm.doc.vendor_response.filter(row => row.accepted);
        
        if (accepted_vendors.length > 0 && frm.doc.docstatus === 1) {
            frm.add_custom_button(__('Vendor'), function() {
                let vendor = accepted_vendors[0].vendor;
                console.log(accepted_vendors[0].vendor)
                let amount = accepted_vendors[0].quoted_amount;

                frappe.new_doc('Payment Entry', {
                    payment_type: 'Pay',
                    mode_of_payment: 'Cash',
                    party_type: 'Supplier',
                    party: vendor,
                    paid_amount: amount,
                    // received_amount: amount,
                });
                // After the Payment Entry form is loaded, set references
                frappe.ui.form.on('Payment Entry', {
                    onload(postingFrm) {
                        postingFrm.add_child('references', {
                            reference_doctype: 'Sourcing Request',
                            reference_name: frm.doc.name
                        });
                        postingFrm.refresh_field('references');
                    }
                });
            }, __('Pay'));
        }
	},
});
