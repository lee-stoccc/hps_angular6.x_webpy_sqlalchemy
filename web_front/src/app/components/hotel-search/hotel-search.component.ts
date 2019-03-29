import {Component, NgModule, OnInit} from '@angular/core';
import {ApiService} from '../../services/api.service';
import {SearchHotelListCondition} from '../../class/searchHotelListCondition';
import {SearchCondition} from '../../class/searchCondition';
import {FormsModule} from '@angular/forms';
import {Subtab, Subbtn} from 'src/app/class/sidebar';
import {SearchHotelList} from '../../class/searchHotelList';
import {NzMessageService} from 'ng-zorro-antd';
import {Router} from '@angular/router';
import {ToolsService} from '../../services/tools.service';
import {ContextService} from '../../services/context.service';
import {User} from '../../class/user';
import {AreaChooseOutput} from 'src/app/class/areaChooseOutput';

@Component({
    selector: 'app-hotel-search,nz-demo-select-search,nz-demo-input-basic,nz-demo-date-picker-start-end,nz-demo-button-basic,' +
        'nz-demo-breadcrumb-separator,nz-demo-table-basic',
    templateUrl: './hotel-search.component.html',
    styleUrls: ['./hotel-search.component.less'],

})
@NgModule({
    imports: [
        FormsModule
    ],
})

export class HotelSearchComponent implements OnInit {
    m_objHotelListCondition: SearchCondition<SearchHotelListCondition> =
        new SearchCondition<SearchHotelListCondition>(SearchHotelListCondition);
    m_listHotelList: SearchHotelList;
    m_listHotelLists: Array<any>;
    m_objUserInfo: User = new User();
    m_objAreaChooseOutput: AreaChooseOutput = new AreaChooseOutput();
    m_boolIsTips: boolean;
    m_strTips: string;
    m_bErrorIsShow: boolean;
    m_sErrorMsg: string;
    public m_objMessage: NzMessageService;
    /**面包屑导航信息 */
    m_lsBreadCrumbList: Array<{ name: string, routelink: string }> = [
        {name: '首页', routelink: '/home'},
        {name: '旅店查询', routelink: ''},
    ];
    public nRowCount: number;
    public boonIsEdit: boolean;
    public m_bShowLoading: boolean;
    /**排序类型 */
    m_lsSortType: Array<any> = [
        {
            CodeNo: 1,
            CodeName: '登记时间'
        },
        {
            CodeNo: 2,
            CodeName: '状态'
        }
    ];

    constructor(
        private m_objApiService: ApiService,
        private m_objRouter: Router,
        private m_objToolsService: ToolsService,
        public m_objContextService: ContextService,
    ) {
    }

    ngOnInit() {
        /**初始化查询信息 */
        // this.m_objContextService.fnge();
        this.m_objHotelListCondition.objPageInfo.nPageNo = 1;
        this.m_objHotelListCondition.objPageInfo.nPageSize = 10;
        // this.m_objHotelListCondition.objPageInfo.nSort = 0;
        this.nRowCount = 0;
        this.m_boolIsTips = false;
    }

    /**当前选择的省市区 */
    fnGetCurrentArea(objAreaChooseOutput: AreaChooseOutput): void {
        this.m_objHotelListCondition.objCondition.nProvinceID = objAreaChooseOutput.CurrentProvinceID;
        this.m_objHotelListCondition.objCondition.nCityID = objAreaChooseOutput.CurrentCityID;
        this.m_objHotelListCondition.objCondition.nDistrictID = objAreaChooseOutput.CurrentDistrictID;
    }

    /**每页条数的改变 */
    fnPageSizeChange(): void {
        if (this.m_objHotelListCondition.objPageInfo.nPageNo === 1) {
            this.fnSearch();
        } else {
            this.m_objHotelListCondition.objPageInfo.nPageNo = 1;
        }
    }

    fnToHotelEdit(nHotelID): void {
        this.boonIsEdit = true;
        this.m_objRouter.navigate(['/home/hotelManagement/hotelEdit'],
            {
                queryParams: {
                    boonIsEdit: this.boonIsEdit,
                    nHotelID: nHotelID
                }
            });
    }

    fnSearch(): void {
        this.m_bShowLoading = true;
        this.m_objHotelListCondition.objCondition.nSearchUserIDMust = this.m_objContextService.m_objUserInfo.UserID;
        this.m_objHotelListCondition.objCondition.sSearchUserNameMust = this.m_objContextService.m_objUserInfo.UserName;
        this.m_objHotelListCondition.objCondition.dtRegStartTime =
            this.m_objToolsService.fnFormatDate(this.m_objHotelListCondition.objCondition.dtRegStartTime, 0);
        this.m_objHotelListCondition.objCondition.dtRegEndTime =
            this.m_objToolsService.fnFormatDate(this.m_objHotelListCondition.objCondition.dtRegEndTime, 1);
        this.m_objApiService.fnSearchHotelList(this.m_objHotelListCondition).subscribe(data => {
            if (data.Code === 200) {
                this.m_boolIsTips = false;
                this.m_listHotelLists = data.Data.DataSet;
                if (this.m_listHotelLists.length === 0) {
                    this.m_objToolsService.fnDoSuccessReturnTips(data.Msg);
                    this.nRowCount = 0;
                } else {
                    for (let i = 0; i < this.m_listHotelLists.length; i++) {
                        this.m_listHotelLists[i]['RegStartTime'] = this.m_listHotelLists[i]['RegStartTime'].substring(0, 10);
                    }
                }
                this.nRowCount = data.Data.RowCount;
                this.m_bShowLoading = false;
            } else if (data.Code === 550) {
                this.m_sErrorMsg = '请输入一个搜索条件！';
                this.m_bShowLoading = false;
                return this.m_bErrorIsShow = true;
            } else {
                this.m_bShowLoading = false;
                this.m_listHotelLists = [];
                this.m_objToolsService.fnErrorReturnTips(data.Msg);
                this.m_objMessage.create('error', data.Msg);
                this.nRowCount = 0;
            }
        });
    }

     // 重置搜索条件
    fnReset(): void {
        this.m_objHotelListCondition.objCondition = new SearchHotelListCondition();
        this.m_listHotelLists = [];
    }
}