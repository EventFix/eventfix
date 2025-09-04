frappe.ready(function() {
	const params = new URLSearchParams(window.location.search);
	const sr = params.get("sr");
	const vendor = params.get("vendor");
	const token = params.get("t");

	if (sr) frappe.web_form.set_value("sourcing_request", sr);
	if (vendor) frappe.web_form.set_value("vendor", vendor);

	// Validate token before letting them submit
	frappe.call({
		method: "event_management.event_managing.doctype.sourcing_request.sourcing_request.validate_vendor_link",
		args: { sr, vendor, token },
		callback: function(r) {
			if (!r.message) {
				frappe.web_form.disable_save();
    			frappe.msgprint("Invalid or expired link. Please contact the requester.");
    		} 
			else {
        	// store token in hidden field if you added one
    			if (frappe.web_form.doc.hasOwnProperty("token")) {
        			frappe.web_form.set_value("token", token);
    			}
    		}
		}
	});
});