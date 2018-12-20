import React, {
	Component
} from 'react';

class SiteHeader extends Component {
	render() {
		return (
			<div className="row-fluid h-100-percent">
		        <div id="site_logo"
		            className="embed-responsive h-100-percent col-md-offset-1 col-md-1 col-sm-offset-1 col-sm-1 col-xs-offset-1 col-xs-1">
		            <img className="embed-responsive-item img-circle img-responsive center-block"/>
		        </div>
		        <div id="site_name" className="h-100-percent col-md-9 col-sm-9 col-xs-9">
		            <img className="embed-responsive-item img-circle img-responsive center-block"/>
		        </div>
		    </div>
		);
	}
}

class SiteInfo extends Component {
	render() {
		return (
			<div className="row-fluid h-100-percent">
		        <div id="site_img"
		            className="embed-responsive col-md-offset-1 col-md-6 col-sm-offset-1 col-sm-6 col-xs-offset-1 col-xs-6 h-100-percent">
		            <img className="embed-responsive-item img-responsive center-block"></img>
		        </div>
		        <div id="site_login" className="col-md-4 col-sm-4 col-xs-4 h-100-percent">
		            <form className="form-horizontal h-100-percent">
		                <div className="form-group text-center">
		                  <label>用户登录</label>
		                </div>
		                <div className="form-group">
		                    <div className="col-md-offset-1 col-md-10 col-sm-offset-1 col-sm-10 input-group">
		                        <div className="input-group-addon">
		                          <span className="glyphicon glyphicon-user"></span>
		                        </div>
		                        <input type="text" autoFocus className="form-control" data-param="username" placeholder="输入用户名"/>
		                    </div>
		                </div>
		                <div className="form-group">
		                    <div className="col-md-offset-1 col-md-10 col-sm-offset-1 col-sm-10 input-group">
		                        <div className="input-group-addon">
		                          <span role="button" className="glyphicon glyphicon-eye-open"></span>
		                        </div>
		                        <input type="password" className="form-control" data-param="password" placeholder="输入用户密码"/>
		                    </div>
		                </div>
		                <div className="form-group">
		                    <div className="col-md-offset-1 col-md-10 col-sm-offset-1 col-sm-10">
		                        <div className="checkbox">
		                            <label><input type="checkbox"/> 记住用户名/密码 </label>
		                        </div>
		                    </div>
		                </div>
		                <div className="form-group">
		                    <div className="col-md-offset-1 col-md-10 col-sm-offset-1 col-sm-10">
		                        <button type="submit" className="btn btn-large btn-block btn-primary">登录</button>
		                    </div>
		                </div>
		            </form>
		        </div>
		    </div>
		);
	}
}

class LayerMsg extends Component {
	render() {
		return (
			<div>
				<div className="row-fluid h-10-percent"></div>
			    <div id="layerMsg" className="modal in" tabIndex="-1" role="dialog">
			        <div className="modal-dialog" role="document">
			            <div className="modal-content">
			                <div className="modal-header">
			                    <button type="button" className="close" data-dismiss="modal"
			                        aria-label="Close">
			                        <span aria-hidden="true">&times;</span>
			                    </button>
			                    <h4 className="modal-title"></h4>
			                </div>
			                <div className="modal-body"></div>
			                <div className="modal-footer">
			                    <button type="button" className="btn btn-default cancel hidden"
			                        data-dismiss="modal"></button>
			                    <button type="button" className="btn btn-primary confirm hidden"
			                        data-dismiss="modal"></button>
			                </div>
			            </div>
			        </div>
			    </div>
	    	</div>
		);
	}
}

// export {SiteHeader};
// export {SiteInfo};
// export {LayerMsg};
export {
	SiteHeader,
	SiteInfo,
	LayerMsg
};