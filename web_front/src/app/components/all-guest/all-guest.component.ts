import { Component, OnInit, ElementRef } from '@angular/core';
import { Subtab } from '../../class/sidebar';
import { ContextService } from 'src/app/services/context.service';
import { SearchCondition } from '../../class/searchCondition';
import { Pagination } from 'src/app/class/pagination';
import { AllGuestCheckinCondition } from '../../class/allGuestCheckinCondition';
import { ApiService } from 'src/app/services/api.service';
import { GuestCheckinResult } from '../../class/guestCheckinResult';
import { Router, NavigationEnd } from '@angular/router';
import { ToolsService } from 'src/app/services/tools.service';
import { DictResult } from '../../class/dictionary';
import { AreaChooseOutput } from 'src/app/class/areaChooseOutput';
import { MatchType } from '../../class/matchType';

@Component({
    selector: 'app-all-guest',
    templateUrl: './all-guest.component.html',
    styleUrls: ['./all-guest.component.less']
})
export class AllGuestComponent implements OnInit {
    /**侧边栏 */
    // m_objSubtab: Array<Subtab> = this.m_objContextService.m_objSideTabList.guestCheckin;
    /**全部旅客查询条件 */
    m_objAllGuestCondition: SearchCondition<AllGuestCheckinCondition> =
    new SearchCondition<AllGuestCheckinCondition>(AllGuestCheckinCondition);
    // 全部旅客入住数据
    m_lsAllGuestCheckinList: Pagination<GuestCheckinResult> = new Pagination<GuestCheckinResult>();
    // m_nRowCount: number;
    /**面包屑导航信息 */
    m_lsBreadCrumbList: Array<{name: string, routelink: string}> = [
        {name: '首页', routelink: '/home'},
        {name: '所有旅客入住查询', routelink: ''}
    ];
    /**民族信息 */
    m_lsGresNation: Array<DictResult> = [];
    /**加载框 */
    m_bShowLoading: boolean;
    /**错误信息 */
    m_sErrorMsg: string;
    /**是否显示错误信息组件 */
    m_bShowError: boolean;
    /**排序类型 */
    m_lsSortType: Array<any> = [
        {
            CodeNo: 1,
            CodeName: '入住时间'
        },
        {
            CodeNo: 2,
            CodeName: '状态'
        }
    ];
    /**认证类型 */
    m_lsMatchType: Array<MatchType> = [
        {
            label: '匹配',
            value: 1,
            checked: false
        },
        {
            label: '匹配异常',
            value: 2,
            checked: false
        },
        {
            label: '无证件',
            value: 3,
            checked: false
        }
    ];
    /**已选认证类型 */
    m_lsMatchTypeChecked: Array<number> = [];
    title = '啦啦啦';
    constructor(
        public m_objContextService: ContextService,
        public m_objApiService: ApiService,
        public m_objRouter: Router,
        public m_objToolsService: ToolsService,
        public m_objElementRef: ElementRef,
    ) {
        this.m_objRouter.events.subscribe(event => {
            if (event instanceof NavigationEnd) {
            }
        })
    }

    ngOnInit() {
        this.m_objAllGuestCondition.objPageInfo.nPageNo = 1;
        this.m_objAllGuestCondition.objPageInfo.nPageSize = 10;
        this.m_lsAllGuestCheckinList.RowCount = 0;
    }

    /**查询全部入住旅客 */
    fnSearchGuestCheckinLinst(): void {
        /**加载框 */
        this.m_bShowLoading = true;
        /**当前登陆用户ID */
        this.m_objAllGuestCondition.objCondition.nSearchUserIDMust = this.m_objContextService.m_objUserInfo.UserID;
        /**当前登陆用户名 */
        this.m_objAllGuestCondition.objCondition.sSearchUserNameMust = this.m_objContextService.m_objUserInfo.UserName;
        /**格式化日期 */
        this.m_objAllGuestCondition.objCondition.sBornDateStart =
        this.m_objToolsService.fnFormatDate(this.m_objAllGuestCondition.objCondition.sBornDateStart, 0);
        this.m_objAllGuestCondition.objCondition.sBornDateEnd =
        this.m_objToolsService.fnFormatDate(this.m_objAllGuestCondition.objCondition.sBornDateEnd, 1);
        this.m_objAllGuestCondition.objCondition.sHotelBornDateStart =
        this.m_objToolsService.fnFormatDate(this.m_objAllGuestCondition.objCondition.sHotelBornDateStart, 0);
        this.m_objAllGuestCondition.objCondition.sHotelBornDateEnd =
        this.m_objToolsService.fnFormatDate(this.m_objAllGuestCondition.objCondition.sHotelBornDateEnd, 1);
        this.m_objAllGuestCondition.objCondition.sCheckInDateTimeStart =
        this.m_objToolsService.fnFormatDate(this.m_objAllGuestCondition.objCondition.sCheckInDateTimeStart, 0);
        this.m_objAllGuestCondition.objCondition.sCheckInDateTimeEnd =
        this.m_objToolsService.fnFormatDate(this.m_objAllGuestCondition.objCondition.sCheckInDateTimeEnd, 1);

        this.m_objApiService.fnAllGuestCheckinList(this.m_objAllGuestCondition).subscribe( data => {
            if (data.Code !== 200) {
                this.m_bShowLoading = false;
                this.m_bShowError = true;
                this.m_sErrorMsg = data.Msg;
                this.m_lsAllGuestCheckinList.RowCount = 0;
                this.m_lsAllGuestCheckinList.DataSet = [];
            } else {
                if (data.Data.RowCount === 0) {
                    this.m_bShowLoading = false;
                    this.m_bShowError = true;
                    this.m_sErrorMsg = '没有查找到匹配的数据，请修改查询条件！';
                    this.m_lsAllGuestCheckinList.RowCount = 0;
                    this.m_lsAllGuestCheckinList.DataSet = [];
                } else {
                    this.m_lsAllGuestCheckinList = data.Data;
                    this.fnMoveToTable();
                }
            }
        });
    }

    /**每页显示条数改变 */
    fnPageSizeChange(value): void {
        this.m_objAllGuestCondition.objPageInfo.nPageNo = 1;
        this.m_objAllGuestCondition.objPageInfo.nPageSize = value;
        if (!!this.m_lsAllGuestCheckinList.DataSet && this.m_lsAllGuestCheckinList.DataSet.length !== 0) {
            this.fnSearchGuestCheckinLinst();
        }
    }

    /**页码改变 */
    fnPageIndexChange(): void {
        if (!!this.m_lsAllGuestCheckinList.DataSet && this.m_lsAllGuestCheckinList.DataSet.length !== 0) {
            this.fnSearchGuestCheckinLinst();
        }
    }

    /**当前选择的省市区 */
    fnGetCurrentArea(objAreaChooseOutput: AreaChooseOutput): void {
        this.m_objAllGuestCondition.objCondition.nProvinceID = objAreaChooseOutput.CurrentProvinceID;
        this.m_objAllGuestCondition.objCondition.nCityID = objAreaChooseOutput.CurrentCityID;
        this.m_objAllGuestCondition.objCondition.nDistrictID = objAreaChooseOutput.CurrentDistrictID;
    }

    /**导航至旅客入住详情 */
    fnToGuestCheckinDetails(id: number): void {
        this.m_objRouter.navigate(['/home/guestCheckin/guestDetails'], {
            queryParams: {
                type: 1,
                id: id
            }
        });
    }

    /**重置搜索条件 */
    fnReset(): void {
        this.m_objAllGuestCondition.objCondition = new AllGuestCheckinCondition();
        this.m_lsMatchType.forEach(item => {
            item.checked = false;
        });
        this.m_lsMatchType.forEach(item => {
            item.checked = false;
        });
    }

    /**选择认证类型 */
    fnMatchChange(value: string[]): void {
        this.m_objAllGuestCondition.objCondition.lsMatchResult = value;
    }

    /**滚动到数据表格 */
    fnMoveToTable(): void {
        const element = this.m_objElementRef.nativeElement.querySelector('#resultTable');
        const height = element.offsetTop;
        const tableRow = document.querySelector('.table-row');
        if (tableRow) {
            this.m_bShowLoading = false;
            document.querySelector('.layer-main').scrollTop = height - 90;
        } else {
            setTimeout(() => {
                this.fnMoveToTable();
            }, 300);
        }
    }
}