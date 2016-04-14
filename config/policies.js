/**
 * Policies rules
 * @doc http://sailsjs.org/documentation/concepts/Policies
 */

module.exports.policies = {
	TeleinfoController: ['checkToken', 'Human']
};

