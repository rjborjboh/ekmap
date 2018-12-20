/**
 * store all interface urls.
 */
var ekUrls = {};

function setUrls(config) {
	if (!config) return ekUrls;
	ekUrls.serverDoor = config.serverDomain + 'ekMapService/rest/';

	ekUrls.interfaces = {
		//用于登陆
		'user_login': 'userResource/login',
		//用于退出登陆
		'user_logout': 'userResource/loginout',
	};

	if (config.storage) {
		config.storage.setItem('server_door', JSON.stringify(ekUrls.serverDoor));
		config.storage.setItem('link_urls', JSON.stringify(ekUrls.interfaces));
	} else {
		if (console.error) console.error('[config] must loaded before [interface]!!!');
	}
	return ekUrls;
}

module.exports = setUrls;