# coding: utf-8
from libs import web
from core.modules.module_handle import api_handle
from libs.orm.ormutils import dbtranscoped
from models.hps.l_loperating_log import OperatingLog
from models.hps.u_user import User
from utils import obj_to_json
from sqlalchemy import and_, or_
from utils.func_api import FuncResult
from utils.tools import to_datetime, result_data, obj_to_dict, dict_to_name
from sqlalchemy import and_, or_, text
from sqlalchemy import *
import json


class handler(object):
    @api_handle(db=True)
    def POST(self):
        return self.data_handle()

    @dbtranscoped()
    def data_handle(self):
        objInput = web.input()
        try:
            obj_input = web.input()
            objCondition = obj_input.get('objCondition')
            objPageInfo = obj_input.get('objPageInfo')
            dictCondition = json.loads(objCondition)
            dictPageInfo = json.loads(objPageInfo)
            if 'nUserID' in dictCondition and dictCondition['nUserID']:
                nUserID = dictCondition['nUserID']
            else:
                nUserID = ''
            if 'sWorkCode' in dictCondition and dictCondition['sWorkCode']:
                sWorkCode = dictCondition['sWorkCode']
            else:
                sWorkCode = ''
            if 'sUserCode' in dictCondition and dictCondition['sUserCode']:
                sUserCode = dictCondition['sUserCode']
            else:
                sUserCode = ''
            if 'sUserName' in dictCondition and dictCondition['sUserName']:
                sUserName = dictCondition['sUserName']
            else:
                sUserName = ''
            if 'nOperaType' in dictCondition and dictCondition['nOperaType']:
                nOperaType = dictCondition['nOperaType']
            else:
                nOperaType = ''
            if 'sPost' in dictCondition and dictCondition['sPost']:
                sPost = dictCondition['sPost']
            else:
                sPost = ''
            if 'sDateStart' in dictCondition and dictCondition['sDateStart'] and dictCondition['sDateStart'] != '':
                dtDateStart = to_datetime(dictCondition['sDateStart'])
            else:
                dtDateStart = ''
            if 'sDateEnd' in dictCondition and dictCondition['sDateEnd'] and dictCondition['sDateEnd'] != '':
                dtDateEnd = to_datetime(dictCondition['sDateEnd'])
            else:
                dtDateEnd = ''
                # objPageInfo = dictCondition['objPageInfo']
                # objPageInfo = json.loads(objPageInfo)
        except Exception, ce:
            print Exception, ce
            return FuncResult(fail='参数有误!')
        return self.search_log_list(dictPageInfo, nUserID, sWorkCode, sUserCode, sUserName,
                                    nOperaType, sPost,
                                    dtDateStart, dtDateEnd)

    def search_log_list(self, dictPageInfo, nUserID, sWorkCode, sUserCode, sUserName, nOperaType,
                        sPost, dtDateStart, dtDateEnd):
        strSql = OperatingLog().query2(OperatingLog, User.UserCode).join(User, OperatingLog.UserID == User.UserID)
        if nUserID != "":
            strSql = strSql.filter(OperatingLog.UserID == nUserID)
        if sWorkCode != "":
            strSql = strSql.filter(OperatingLog.WorkCode == sWorkCode)
        if sUserCode != "":
            strSql = strSql.filter(User.UserCode == sUserCode)
        if sUserName != "":
            strSql = strSql.filter(OperatingLog.UserName == sUserName)
        if nOperaType != "":
            strSql = strSql.filter(OperatingLog.OperaType == nOperaType)
        if dtDateStart != "":
            strSql = strSql.filter(OperatingLog.CreateTime >= dtDateStart)
        if dtDateEnd != "":
            strSql = strSql.filter(OperatingLog.CreateTime <= dtDateEnd)
        # if sPost != "":
        #     strSql = strSql.filter(User.Post == sPost)
        sSqlOrderBy = self.order_by(strSql, dictPageInfo['nSort'])
        lsQueryData = sSqlOrderBy.limit(
            dictPageInfo['nPageSize']).offset((dictPageInfo['nPageNo'] - 1) * dictPageInfo['nPageSize']).all()
        if strSql.all():
            RowCount = len(strSql.all())
        else:
            RowCount = 0
        lsDataSet = []
        for objQueryData in lsQueryData:
            distData = web.storage(**obj_to_dict(objQueryData[0].copy(bind=False)))
            distData['UserCode'] = objQueryData[1]
            distData['KeyWord'] = objQueryData[0].KeyWord
            if objQueryData[0].OperaType:
                num = objQueryData[0].OperaType
                num = int(filter(str.isdigit, num.encode('utf-8')))
                distData['OperaTypeName'] = dict_to_name(num, 'opera_type')
            else:
                distData['OperaTypeName'] = ''
            lsDataSet.append(distData)
        Data = result_data(dictPageInfo['nPageNo'], dictPageInfo['nPageSize'], RowCount, lsDataSet)
        return FuncResult(success=True, msg='操作成功！', data=Data)

    def order_by(self, sSql, nSort):
        sOrderBy = sSql
        if nSort == 1:
            sOrderBy = sOrderBy.order_by(desc(OperatingLog.CreateTime))
        elif nSort == 2:
            sOrderBy = sOrderBy.order_by(desc(OperatingLog.OperaType))
        return sOrderBy
