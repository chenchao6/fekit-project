var validator = function(formEl){
	this.validateGroup = formEl.find("[data-jvalidator-pattern]").jvalidator({
		validation_events: ["blur"],
		on: {
			invalid: function(evt, el, pattern) {
				var msg = pattern[0].message;
				$(".warning").removeClass("hide").find(".J-warning-text").text(msg);
			},
			valid: function(evt, el, pattern) {
			},
			focus : function(){
				$(".warning").addClass("hide");
			}
		}
	});
}
validator.prototype.valid = function(callback) {
	this.validateGroup.validateAll(function(result){
		callback && callback(result);
	});
};
validator.prototype.remove = function(selector) {
	this.validateGroup.remove(selector)
};
validator.prototype.append = function(selector) {
	this.validateGroup.append(selector);
};


module.exports = {
	init : function(formEl){
		return new validator(formEl);
	}
}