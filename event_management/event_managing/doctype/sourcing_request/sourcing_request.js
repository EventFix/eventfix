// Copyright (c) 2025, Owais Khan and contributors
// For license information, please see license.txt

frappe.ui.form.on("Sourcing Request", {
	refresh(frm) {
        // Allow choosing only PARENT groups if you want (optional)
        frm.set_query("category", () => {
            return {
                filters: {
                    // adapt this if your parents don't sit under "All Item Groups"
                    is_group: 1,
                    // parent_item_group: "All Item Groups"
                }
            };
        });

        if (!frm.doc.category) return;

        frm.add_custom_button(__("Fetch Items"), () => {
            frappe.call({
                method: "event_management.event_managing.doctype.sourcing_request.sourcing_request.get_items_by_vendor_category",
                args: { category: frm.doc.category },
                callback: (r) => {
                    if (!r.message) return;

                    // clear existing rows before refilling
                    frm.clear_table("items");

                    // r.message = [{child_group: "Hotel", items:[{item_code, item_name, item_group}, ...]}, ...]
                    r.message.forEach(groupBlock => {
                        (groupBlock.items || []).forEach(it => {
                            let row = frm.add_child("items");
                            row.item_code = it.item_code;
                            row.item_name = it.item_name;
                            row.custom_child_group = it.item_group;
                            row.qty = 1;

                            // If you added custom_child_group to Opportunity Item:
                            // if ("custom_child_group" in row) {
                            //     row.custom_child_group = groupBlock.child_group;
                            // }
                            // If Opportunity Item already has a standard `item_group` field, you can set it instead:
                            // row.item_group = it.item_group;
                        });
                    });

                    frm.refresh_field("items");
                    frappe.msgprint(__("Items added for category {0}", [frm.doc.category]));
                }
            });
        }).addClass("btn-primary");
    
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
