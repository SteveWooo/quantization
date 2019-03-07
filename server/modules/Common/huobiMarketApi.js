const request = require("request");
const DEFAULT_HEADERS = {
    "Content-Type": "application/json",
    "User-Agent": "Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/39.0.2171.71 Safari/537.36"
}

function getPayload (swc, options){
	var pars = [];
	for (let item in options.body) {
        pars.push(item + "=" + encodeURIComponent(options.body[item]));
    }
    var p = pars.sort().join("&");
    return p;
}

function callApi (swc, options){
	return new Promise(resolve=>{
		if(options.method === 'GET'){
			url = `${swc.config.market.huobi.baseUrl}${options.path}?${options.payload}`
			var opt = {
				url : url,
				headers : DEFAULT_HEADERS
			}
			opt.proxy = "http://:@127.0.0.1:1080";
			request(opt, (err, res, body)=>{
				if(err){
					console.log('error:', err);
					resolve(null);
					return ;
				}
				body = JSON.parse(body);
				if(body.status === 'ok'){
					resolve(body.tick);
					return ;
				} else {
					console.log('error:', body);
					resolve(null);
					return ;
				}
			})
		}else {
			resolve(null);
			return ;
		}
	})
}

var huobiMarketApi = {
	getDepth : function(swc, options){
		var path = `/market/depth`;
		var body = {
			symbol : options.symbol,
			depth : options.depth || '20',
			type : options.type || 'step0'
		}
		var payload = getPayload(swc, {
			body : body
		})
		return callApi(swc, {
			method : 'GET',
			path : path,
			payload : payload,
			body : body
		})
	}
}

module.exports = huobiMarketApi;