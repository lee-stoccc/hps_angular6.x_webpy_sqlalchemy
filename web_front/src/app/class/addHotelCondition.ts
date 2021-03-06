export class AddHotelCondition {
    nHotelID: number;
    nAddUserIDMust: number; // 操作者id
    sAddUserNameMust: string; // 操作者姓名
    sHotelCode: string;  // 酒店编号
    sHotelName: string;  // 酒店名  *
    sHotelAddr: string;  // 酒店地址  *
    sHotelTel: string;  // 前台电话
    sLegalTel: string;  // 法人电话
    sLegalPerson: string;  // 法人姓名
    sLegalDocNo: string; // (法人证件号码)
    sCoordinate: string;  // 坐标
    nProvinceID: number;  // 省份ID  *
    nCityID: number;  // 城市ID  *
    nDistrictID: number;  // 地区ID  *
    nHotelType: number; // (酒店类型)
    nCreatUserID: number; // (登记人ID;数据库关联UserID);
    sCreatUserCode: string; // (登记人);
    sResponPersonTel: string; // (责任人联系电话);
    sResponPerson: string; // (责任人)
    nRoomCount: number; // (房间数量)
    nBedCount: number; // (床位数量)
    sBusLicenseCode: string; // (营业执照号)
    sBusLicenseName: string; // (营业执照名称)
    sRegStartTime: string; // (登记时间)
    sRemark: string; // (备注)
    nAuditState: number; // (审核状态)
}
