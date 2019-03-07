const crypto = require('crypto');
const CryptoJS = require('crypto-js');
const moment = require('moment');
const HmacSHA256 = require('crypto-js/hmac-sha256');
const request = require("request");
const url = require('url');
const DEFAULT_HEADERS = {
    "Content-Type": "application/json",
    "User-Agent": "Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/39.0.2171.71 Safari/537.36"
}

function getAuth(swc) {
    var sign = swc.config.market.huobi.trade_password + 'hello, moto';
    var md5 = CryptoJS.MD5(sign).toString().toLowerCase();
    let ret = encodeURIComponent(JSON.stringify({
        assetPwd: md5
    }));
    return ret;
}

/**
* options : method, baseurl, path, body
*/
function signSha(swc, options) {
    var pars = [];
    var host = url.parse(swc.config.market.huobi.baseUrl).host;
    for (let item in options.body) {
        pars.push(item + "=" + encodeURIComponent(options.body[item]));
    }
    var p = pars.sort().join("&");
    var meta = [options.method, host, options.path, p].join('\n');
    var hash = HmacSHA256(meta, swc.config.market.huobi.secretKey);
    var Signature = encodeURIComponent(CryptoJS.enc.Base64.stringify(hash));
    // console.log(`Signature: ${Signature}`);
    p += `&Signature=${Signature}`;
    // console.log(p);
    return p;
}

function getBody(swc) {
    return {
        AccessKeyId: swc.config.market.huobi.accessKey,
        SignatureMethod: "HmacSHA256",
        SignatureVersion: 2,
        Timestamp: moment.utc().format('YYYY-MM-DDTHH:mm:ss'),
    };
}

/** 
* 统一请求
* @param options.path
* @param options.payload
* @param options.body
*/
function callApi(swc, options) {
	return new Promise(resolve=>{
		var url = `${swc.config.market.huobi.baseUrl}${options.path}?${options.payload}`;
		var headers = DEFAULT_HEADERS;
		headers.AuthData = getAuth(swc);
		if(options.method === 'GET'){
			var opt = {
				url : url,
				headers : headers
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
					resolve(body.data);
					return ;
				} else {
					console.log('error:', body);
					resolve(null);
					return ;
				}
			})
		} else if (options.method === 'POST'){
			var opt = {
				url : url,
				headers : headers,
				body : options.body,
			}
			opt.proxy = "http://:@127.0.0.1:1080";

			request.post(opt, (err, res, body)=>{
				if(err){
					console.log('error:', err);
					resolve(null);
					return ;
				}
				body = JSON.parse(body);
				if(body.status === 'ok'){
					resolve(body.data);
					return ;
				} else {
					console.log('error:', body);
					resolve(null);
					return ;
				}
			})
		}
	})
}

var huobiApi = {
	//个人信息类
	getAccount: function(swc) {
        var path = `/v1/account/accounts`;
        var body = getBody(swc);
        var payload = signSha(swc, {
        	method : 'GET',
        	path : path,
        	data : body
        });
        return callApi(swc, {
        	method : 'GET',
        	path : path,
        	payload : payload,
        	data : body
        });
    },
    getBalance: function(swc, options) {
    	var path = `/v1/account/accounts/${swc.config.market.huobi.spotId}/balance`;
        var body = getBody(swc);
        var payload = signSha(swc, {
        	method : 'GET',
        	path : path,
        	body : body
        });
        return callApi(swc, {
        	method : 'GET',
        	path : path,
        	payload : payload,
        	body : body
        });
    },

    //市场数据类
    getDepth : function(swc, options) {
    	var path = `/market/depth`;
    	var body = getBody(swc);
    	body.depth = options.depth || '20';
    	body.type = options.type || 'step0';
    	body.symbol = options.symbol;

        var payload = signSha(swc, {
        	method : 'GET',
        	path : path,
        	body : body
        });
        return callApi(swc, {
        	method : 'GET',
        	path : path,
        	payload : payload,
        	body : body
        });
    }
}
module.exports = huobiApi;