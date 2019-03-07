const config = require("./config.json")
async function main(){
	var swc = await require("./server/init.js")(config);
	var result = await swc.Common.huobiMarketApi.getDepth(swc, {
		symbol : 'btcusdt'
	});
	console.log(result);
}

main();