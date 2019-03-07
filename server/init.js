async function init(config){
	var swc = {
		config : config,
		Common : {
			huobiApi : require('./modules/Common/huobiApi'),
			huobiMarketApi : require("./modules/Common/huobiMarketApi")
		}
	}

	return swc;
}

module.exports = init;