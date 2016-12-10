module.exports = function (ns, Api) {
    ns('GET /streams', new Api()
        .param('username', Api.Types.TrimString)
        .param('password', Api.Types.TrimString)
        .param('password2', Api.Types.TrimString)
        .required('username', 'password', 'password2').exec(function (params, callback) {
            callback(null, params);
        }));

    ns('POST /streams', new Api()
        .exec(function (params, callback) {
            callback(null, params)
        }));
    ns('GET /streams/:stream', new Api()
        .exec(function (params, callback) {
            callback(null, params);
        }));
}
