/**
 * define phrases.
 */
var ekPhrases = {};
/* @description
 *    消息字符串的[key]定义请一定按照下记格式定义[三段式消息关键字]:
 *      [msg] . [hash] . [msg的No.]
 *      *****非异常消息以[0]开始长度4位,异常消息以大写[E]开始长度4位,
 *    例如: 'msg.task2add.0001'
 *         'msg.task2mgr.0001'
 *         'msg.h5search.0001'
 * [注意]
 *    当然有些特殊消息可以不用按照上面的规则,
 *    比如一些共同消息等。这类消息的关键字请一定传进完整的关键字,
 *    并且这类消息关键字定义格式必须不小于于[三段],
 *    例如: 'abs.cbs.aas','abs.cbs.dsds.aas'等。
 *    但是建议还是以字符串[msg]开头,以[.]连接。
 * */
ekPhrases.phrases = {
    ////////////////////共通消息////////////////////////Start
    'msg.common.E001': '发生未知错误，请与管理员联系!',
    'msg.common.E002': '数据库操作发生异常，请与管理员联系!',
    'msg.common.E003': '取得机能页面(HTML)失败，请确认页面文件路径是否存在!',
    'msg.common.E004': '退出登录处理失败，是否重试退出操作处理?',
    'msg.common.E005': '取得用户权限处理失败，是否重新取得用户权限?',
    'msg.common.E006': '用户认证失败，请重新登陆!',
    'msg.common.E007': '您没有访问该机能页面的权限!',
    ////////////////////共通消息////////////////////////End
    ///////////////////////////////////////////////////////
    ///////////////////login/////////////////////////Start
    'msg.login.E001': '用户名或密码输入错误!',
    ////////////////////login////////////////////////End
    ///////////////////////////////////////////////////////
    ////////////////////layerMsg////////////////////////Start
    'msg.model.title': '系统消息',
    'msg.model.body': '未知消息',
    'msg.model.cancel': '关闭',
    'msg.model.confirm': '确定',

    // 自定义机能页面弹窗title --- msg.title.xx
    'msg.title.login': '用户登录',

    // 自定义机能页面弹窗footer按钮 --- msg.footer.xx
    'msg.footer.undo': '取消',
    ////////////////////layerMsg////////////////////////End
    ///////////////////////////////////////////////////////
    //home start
    //监控预览	 serverStats。js 	
    'msg.serverStats.0100': '来自主机监控'
};
// get phrase by key.
/**
 * @description
 *     根据传来的关键字取得真正的消息实体字符串
 *     --消息关键字标准格式 [msg] + [hash] + [msg的No.]
 * @param
 *     keyString  [string] 消息关键字
 * @param
 *     dftString  [string] 根据[keyString]取值无效时才会使用的关键字
 * @param
 *     hash string  指定消息所属的hash页面
 * */
ekPhrases.renderMsg = function(keyString, dftString, hash) {
    var msg = '',
        spliter = '.',
        msgKey = '',
        hash = hash;
    if (!keyString || typeof(keyString) !== 'string') keyString = dftString;

    var getValue = function(key) {
        if (!key || typeof(key) !== 'string') return key;
        var msgValue, keys = key.split('.');

        msgKey = 'msg';
        if (keys.length === 1) { // 默认遵循消息关键字标准格式  传进参数为[msg的No.]
            msgKey += spliter + hash + spliter + keys[0];
        } else if (keys.length === 2) { // 默认遵循消息关键字标准格式  传进参数为[hash] + [msg的No.]
            msgKey += spliter + key;
        } else { // 默认传进所有消息关键字(不管是否遵循消息关键字规则)
            msgKey = key;
        }

        msgValue = ekPhrases.phrases[msgKey];
        return msgValue !== undefined ? msgValue : key;
    };
    // 第一次根据指定关键字取值
    msg = getValue(keyString);
    // 第一次根据指定关键字取值失败时,再次根据默认关键字取值
    if ((msg == keyString) && (keyString != dftString)) msg = getValue(dftString);

    return msg;
};

module.exports = ekPhrases;