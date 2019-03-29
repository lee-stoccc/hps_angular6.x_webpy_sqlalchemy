import { Component, OnInit, ElementRef } from '@angular/core';
import { CheckinListCondition } from 'src/app/class/checkinListCondition';
import { SearchCondition } from 'src/app/class/searchCondition';
import { ApiService } from 'src/app/services/api.service';
import { Pagination } from 'src/app/class/pagination';
import { CheckinList } from 'src/app/class/checkinList';
import { Period } from 'src/app/class/period';
import { ToolsService } from 'src/app/services/tools.service';
import { CheckinService } from 'src/app/services/checkin.service';
import { ContextService } from 'src/app/services/context.service';
import { Router } from '@angular/router';
import { AreaChooseOutput } from 'src/app/class/areaChooseOutput';
import { Subtab } from '../../class/sidebar';

@Component({
    selector: 'app-checkin-list',
    templateUrl: './checkin-list.component.html',
    styleUrls: ['./checkin-list.component.less']
})
export class CheckinListComponent implements OnInit {
    m_objCheckinListCondition: SearchCondition<CheckinListCondition> =
        new SearchCondition<CheckinListCondition>(CheckinListCondition);
    m_lsCheckinList: Pagination<CheckinList> = new Pagination<CheckinList>();
    m_sCheckinDatePeriod = '0';
    m_sRegDatePeriod = '0';
    m_nTotal: number;
    m_bShowLoading: boolean;
    m_objAreaChooseOutput: AreaChooseOutput = new AreaChooseOutput();
    m_bErrorIsShow = false;
    m_sErrorMsg: string;
    /**面包屑导航信息 */
    m_lsBreadCrumbList: Array<{name: string, routelink: string}> = [
        {name: '首页', routelink: '/home'},
        {name: '旅店开房查询', routelink: ''},
    ];
    m_lsSort: Array<any> = [
        {
            CodeNo: 1,
            CodeName: '登记时间'
        },
        {
            CodeNo: 2,
            CodeName: '审核状态'
        },
        {
            CodeNo: 3,
            CodeName: '城市'
        }
    ];
    constructor(
        public m_objContextService: ContextService,
        private m_objApiService: ApiService,
        private m_objToolsService: ToolsService,
        public m_objCheckinService: CheckinService,
        private m_objRouter: Router,
        public m_objElementRef: ElementRef
    ) { }

    ngOnInit() {
        /**操作人信息 */
        this.m_objCheckinListCondition.objCondition.nSearchUserIDMust = this.m_objContextService.m_objUserInfo.UserID;
        this.m_objCheckinListCondition.objCondition.sSearchUserNameMust = this.m_objContextService.m_objUserInfo.UserName;
        /**初始化查询信息 */
        this.m_objCheckinListCondition.objPageInfo.nPageNo = 1;
        this.m_objCheckinListCondition.objPageInfo.nPageSize = 10;
        this.m_objCheckinListCondition.objPageInfo.nSort = 1;
        this.m_lsCheckinList.RowCount = 0;

        this.fnChangeRegDate();
        this.fnChangePeriod();
    }
    /**排序 */
    fnSort(nCodeID: number): void {
        this.m_objCheckinListCondition.objPageInfo.nSort = nCodeID;
        this.fnSearchHotelCheckinList();
    }
    /**当前选择的省市区 */
    fnGetCurrentArea(objAreaChooseOutput: AreaChooseOutput): void {
        this.m_objCheckinListCondition.objCondition.nProvinceID = objAreaChooseOutput.CurrentProvinceID;
        this.m_objCheckinListCondition.objCondition.nCityID = objAreaChooseOutput.CurrentCityID;
        this.m_objCheckinListCondition.objCondition.nDistrictID = objAreaChooseOutput.CurrentDistrictID;
    }

    /**查看酒店入住历史记录 */
    fnViewChecklogList(nHotelID: number, sHotelName: string): void {
        this.m_objCheckinService.m_nHotelID = nHotelID;
        this.m_objCheckinService.m_sHotelName = sHotelName;
        this.m_objRouter.navigate(['home/hotelCheckin/checkinLogList']);
    }

    /**获取酒店开房列表 */
    fnSearchHotelCheckinList(): any {
        // 日期格式化
        this.m_objCheckinListCondition.objCondition.sRegStartDate =
            this.m_objToolsService.fnFormatDate(this.m_objCheckinListCondition.objCondition.sRegStartDate, 0);
        this.m_objCheckinListCondition.objCondition.sRegEndDate =
            this.m_objToolsService.fnFormatDate(this.m_objCheckinListCondition.objCondition.sRegEndDate, 1);
        this.m_objCheckinListCondition.objCondition.sCheckInStartDate =
            this.m_objToolsService.fnFormatDate(this.m_objCheckinListCondition.objCondition.sCheckInStartDate, 0);
        this.m_objCheckinListCondition.objCondition.sCheckInEndDate =
            this.m_objToolsService.fnFormatDate(this.m_objCheckinListCondition.objCondition.sCheckInEndDate, 1);
        if (this.m_objCheckinListCondition.objCondition.sRegStartDate === null
            || this.m_objCheckinListCondition.objCondition.sRegEndDate === null) {
                this.m_sErrorMsg = '必须要选择一段登记时间！';
                return this.m_bErrorIsShow = true;
        }
        if (this.m_objCheckinListCondition.objCondition.sCheckInStartDate === null
            || this.m_objCheckinListCondition.objCondition.sCheckInEndDate === null) {
                this.m_sErrorMsg = '必须要选择一段入住时间！';
                return this.m_bErrorIsShow = true;
        }
        this.m_bShowLoading = true;
        if (this.m_objCheckinListCondition.objPageInfo.nPageNo === 0) {
            this.m_objCheckinListCondition.objPageInfo.nPageNo = 1;
        }
        this.m_objApiService.fnSearchHotelCheckinList(this.m_objCheckinListCondition).subscribe(data => {
            // debugger;
            this.m_bShowLoading = false;
            if (data.Code === 200) {
                if (data.Data.RowCount === 0) {
                    this.m_bErrorIsShow = true;
                    this.m_sErrorMsg = '没有搜索到任何数据!';
                } else {
                    this.fnMoveToTable();
                }
                this.m_lsCheckinList = data.Data;
            } else {
                this.m_bErrorIsShow = true;
                this.m_sErrorMsg = data.Msg;
            }
        });
    }
    /**每页条数的改变 */
    fnPageSizeChange(value): void {
        this.m_objCheckinListCondition.objPageInfo.nPageNo = 1;
        this.m_objCheckinListCondition.objPageInfo.nPageSize = value;
        if (!!this.m_lsCheckinList.DataSet && this.m_lsCheckinList.DataSet.length !== 0) {
            this.fnSearchHotelCheckinList();
        }
    }

    /**页码改变 */
    fnPageIndexChange(): void {
        if (!!this.m_lsCheckinList.DataSet && this.m_lsCheckinList.DataSet.length !== 0) {
            this.fnSearchHotelCheckinList();
        }
    }

    /**登记时间区间 */
    fnChangeRegDate(): void {
        const objDate: Period = this.m_objToolsService.fnChangePeriod(this.m_sRegDatePeriod);
        this.m_objCheckinListCondition.objCondition.sRegStartDate = objDate.sDateStart;
        this.m_objCheckinListCondition.objCondition.sRegEndDate = objDate.sDateEnd;
    }

    /**入住时间区间 */
    fnChangePeriod(): void {
        const objDate: Period = this.m_objToolsService.fnChangePeriod(this.m_sCheckinDatePeriod);
        this.m_objCheckinListCondition.objCondition.sCheckInStartDate = objDate.sDateStart;
        this.m_objCheckinListCondition.objCondition.sCheckInEndDate = objDate.sDateEnd;
    }

    /**重置搜索条件 */
    fnReset(): void {
        this.m_objCheckinListCondition.objCondition = new CheckinListCondition();
    }

    /**滚动到数据表格 */
    // fnMoveToTable(): void {
    //     setTimeout(() => {
    //         const element = this.m_objElementRef.nativeElement.querySelector('#resultTable');
    //         const height = element.offsetTop;
    //         this.m_objElementRef.nativeElement.querySelector('.g-main').scrollTop = height;
    //     }, 300);
    // }
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