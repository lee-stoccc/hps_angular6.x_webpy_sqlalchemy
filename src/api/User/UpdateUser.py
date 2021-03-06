# coding: utf-8

import web

from core.modules.module_handle import api_handle
from libs.orm.ormutils import dbtranscoped
from models.hps.u_user import User
from utils.func_api import FuncResult
from utils.tools import is_null


class handler(object):
    @api_handle(db=True)
    def POST(self):
        return self.data_handle()

    @dbtranscoped()
    def data_handle(self):
        '''
        获取请求参数
        '''
        objInput = web.input()
        try:
            nUpdateUserIDMust = objInput.get('nUpdateUserIDMust')
            sUpdateUserNameMust = objInput.get('sUpdateUserNameMust')
            nUserID = objInput.get('nUserID')
            sTel = objInput.get('sTel')
            sWorkCode = objInput.get('sWorkCode')
            sUserName = objInput.get('sUserName')
            sPost = objInput.get('sPost')
            sRemark = objInput.get('sRemark')
            if is_null(nUpdateUserIDMust) :
                return FuncResult(fail='参数\'nUpdateUserIDMust\'不能为空')
            elif is_null(sUpdateUserNameMust) :
                return FuncResult(fail='参数\'sUpdateUserNameMust\'不能为空')
            elif is_null(nUserID) :
                return FuncResult(fail='参数\'nUserID\'不能为空')
        except Exception, ce:
            # 异常处理
            return FuncResult(fail='参数有误!')

        return self.update_user(nUserID, sTel, sWorkCode, sUserName, sPost, sRemark)

    def update_user(self, nUserID, sTel, sWorkCode, sUserName, sPost, sRemark):
        # 新增数据
        objUser = User().query.filter(User.UserID == nUserID) \
            .first()

        if not is_null(sTel):
            objUser.Tel = sTel
        if not is_null(sWorkCode):
            objUser.WorkCode = sWorkCode
        if not is_null(sUserName):
            objUser.UserName = sUserName
        if not is_null(sPost):
            objUser.Post = sPost
        if not is_null(sRemark):
            objUser.Remark = sRemark
        # 保存更改到数据库
        objUser.save()

        return FuncResult(success=True, msg='资料修改成功！')
