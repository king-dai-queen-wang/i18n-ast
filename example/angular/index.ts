import { TranslateService } from "@ngx-translate/core";
import { Component, Inject, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { CvppTableNs } from '../../../component/platform-common/cvpp-table/cvpp-table.component';
import { SystemVONs } from '../../../core/vo/SystemVO';
import { CityService, CityServiceNs } from '../../../core/biz-services/city/city.service';
import { FormBuilder, FormGroup } from '@angular/forms';
import { CvppValidatorsService } from '../../../core/infra/validators/validators.service';
import { ShowMessageService } from '../../../widget/show-message/show-message';
import { ActionCodeDict } from '../../../config/action-code';
import { NzModalService } from 'ng-zorro-antd/modal';
import { CvppUtilService } from '../../../core/infra/cvpp-util.service';
import { environment } from '../../../../environments/environment';
import { CarServiceStatusOption, CarServiceStatusOptionInjectionToken } from '../../../config/const-value';
import { Observable } from 'rxjs';
import { delay, map, pluck, startWith, switchMap, tap } from 'rxjs/operators';
import { DownloadFun } from '../../../directives/download.directive';
import Policy = CityServiceNs.Policy;
import { shareAndCache } from '../../../core/rxjs-helper/shareAndCache';
import { replaceHttpError } from '../../../core/rxjs-helper/replaceHttpError';
import { ProgramService } from '../../../core/biz-services/system/program.service';
import { convertUnknownToEmptyStringInAnObject } from '../../../core/rxjs-helper/convertUnknownToEmptyString';
import { FormSelectorOption } from "../../../component/common/multi-selector/selector.component";
import { BaiduCityProSingle, MapService } from "../../../core/common-services/map.service";
const dateFormat: string = 'date:yyyy/MM/dd HH:mm:ss';
enum TabPage {
  InitPage = '',
  Add = 'add',
  Edit = 'edit',
  ReadAuth = 'readAuth',
  EditAuth = 'editAuth',
}
@Component({
  selector: 'app-car-service',
  templateUrl: './car-service.component.html'
  // styleUrls: ['./car-service.component.less']
})
export class CarServiceComponent implements OnInit {
  strategyList$: Observable<Policy[]>;
  roleTableConfig: CvppTableNs.TableConfig;
  detailTableConfig: CvppTableNs.TableConfig;
  vServiceData: SystemVONs.TerminatorInfo[] = [];
  vServiceDetail: SystemVONs.TerminatorInfo[] = [];
  @ViewChild('roleTableOpTpl', {
    static: true
  })
  roleTableOpTpl: TemplateRef<any>;
  @ViewChild('status', {
    static: true
  })
  status: TemplateRef<any>;
  @ViewChild('checkSts', {
    static: true
  })
  checkSts: TemplateRef<any>;
  tabIndex: number;
  tabPage: string;
  actionCodeObj: any;
  menuCodeObj: any;
  roleConfigForm: FormGroup;
  changeConfigForm: FormGroup;
  curRoleId: number = null;
  tabPageEnum = TabPage;
  actionCodes = ActionCodeDict;
  roleTypes = SystemVONs.RoleType;
  checkList = [];
  strategyList: Policy[] = [];
  serviceDetail: any;
  exportUrl: string = environment.baseUrl.bs + '/func/vservice/export';
  exportParam: any;
  programList$: Observable<string[]>;
  modelList$: Observable<string[]>;
  iviVersionList$: Observable<string[]>;
  proListByProCode$: Observable<FormSelectorOption[]>;
  cityListByProCode$: Observable<FormSelectorOption[]>;
  private proList = [];
  protected cityList = [];
  get EnableExport() {
    return this.vServiceData && this.vServiceData.length > 0;
  }
  constructor(private cityService: CityService, private mapService: MapService, private cvppValidatorsService: CvppValidatorsService, private messageService: ShowMessageService, private formBuilder: FormBuilder, private modalService: NzModalService, private cvppUtilService: CvppUtilService, @Inject(CarServiceStatusOptionInjectionToken)
  public cartServiceStatusOptionList: typeof CarServiceStatusOption, private programService: ProgramService, public translate: TranslateService, public translate: TranslateService) {
    this.tabIndex = 0;
    this.tabPage = TabPage.InitPage;
    this.actionCodeObj = {};
    this.menuCodeObj = {};
    this.roleConfigForm = this.formBuilder.group({
      vin: [null, ''],
      auditType: [null, ''],
      status: [null, ''],
      queryType: ['applyTime', ''],
      stratName: [null, ''],
      startTime: [null, ''],
      endTime: [null, ''],
      program: [null, null],
      model: [null, null],
      iviVersion: [null, null],
      cityCode: [null, null],
      proCode: [null, null]
    });
    this.changeConfigForm = this.formBuilder.group({
      stratName: [null, '']
    });
    this.strategyList$ = this.cityService.getStrategyList({
      page: 1,
      rows: 9999
    }).pipe(shareAndCache('/func/policy/list?size=9999'), replaceHttpError(), map(r => r ? r.Value.data : []));
  }
  getVserviceList = (type?: number) => {
    this.checkList = [];
    let data = this.roleConfigForm.getRawValue();
    if (!this.cvppUtilService.checkDataTime(data)) {
      this.messageService.showAlertMessage(this.translate.instant("cuowu"), this.translate.instant("kaishishijianbunengdayujieshushijian"), 'error');
      return;
    }
    data = this.cvppUtilService.RequestDataTimeBuild(data);
    if (data.cityCode === null) {
      if (data.proCode === null || data.proCode === '') {
        // @ts-ignore
        data.cityCodeList = [];
      } else {
        // @ts-ignore
        data.cityCodeList = this.cityList;
      }
    } else {
      // @ts-ignore
      data.cityCodeList = [data.cityCode];
    }
    data['rows'] = this.roleTableConfig.pageSize;
    if (type) {
      this.roleTableConfig.pageNum = 1;
    }
    data['page'] = this.roleTableConfig.pageNum;
    data = convertUnknownToEmptyStringInAnObject(data);
    this.cityService.getVserviceList(data).subscribe(resData => {
      if (resData.Code === 0) {
        this.exportParam = data;
        this.vServiceData = resData.Value;
        this.roleTableConfig.total = resData.Value.length !== 0 ? resData.Value[0].total : 0;
        for (let i = 0; i < this.vServiceData.length; i++) {
          this.vServiceData[i]['index'] = i;
        }
      }
    });
  };
  public search() {
    this.getVserviceList();
  }
  public tabChange() {
    if (this.tabIndex === 0) {
      this.tabPage = TabPage.InitPage;
    }
  }
  public changeStrategy() {
    if (this.checkList.length !== 0) {
      this.tabIndex = 1;
      this.tabPage = TabPage.Edit;
      this.roleConfigForm.reset();
      this.roleConfigForm.patchValue({
        'queryType': 'applyTime'
      });
      const data = {
        policyName: '',
        beginTime: '',
        endTime: '',
        rows: '999',
        page: '1'
      };
      this.cityService.getStrategyList(data).subscribe(resData => {
        if (resData.Code === 0) {
          this.strategyList = resData.Value.data;
        }
      });
    } else {
      this.messageService.showAlertMessage(this.translate.instant("qingxuanzecheliang"), this.translate.instant("qingxuanzecheliang"), 'error');
    }
  }
  public reset() {
    this.roleConfigForm.reset();
    this.roleConfigForm.patchValue({
      'queryType': 'applyTime'
    });
  }
  public cancel() {
    this.tabIndex = 0;
    this.tabPage = TabPage.InitPage;
  }
  public saveData() {
    const vinList = [];
    for (let j = 0; j < this.checkList.length; j++) {
      vinList.push(this.vServiceData[this.checkList[j]].vin);
    }
    const data = {
      vins: vinList,
      type: '0',
      confId: this.changeConfigForm.getRawValue().stratName
    };
    this.cityService.changeVservice(data).subscribe(resData => {
      if (resData.Code === 0) {
        this.messageService.showAlertMessage(this.translate.instant("biangengchenggong"), this.translate.instant("biangengcelvechenggong"), 'success');
        this.tabIndex = 0;
        this.tabPage = TabPage.InitPage;
        this.checkList = [];
        this.reGetData();
      } else {
        this.messageService.showAlertMessage(this.translate.instant("biangengshibai"), resData.Message, 'error');
      }
    });
  }
  public reGetData() {
    this.cancel();
    this.roleTableConfig.pageSize = 10;
    this.roleTableConfig.pageNum = 1;
    this.getVserviceList();
  }
  public stopService() {
    if (this.checkList.length !== 0) {
      this.modalService.success({
        nzTitle: this.translate.instant("querenyaojiangfuwuzhuangtaigaiwei\u201Cshiyongdaoqi\u201D\uFF1F"),
        nzContent: this.translate.instant("zantingzhuangtai\uFF0Ccheliangjiangbunengxiangshouzhengchangfuwu\uFF0Cquerentijiaoqingdianji\"queding\"anjian\u3002"),
        nzCancelText: this.translate.instant("quxiao"),
        nzOnOk: () => {
          const vinList = [];
          for (let j = 0; j < this.checkList.length; j++) {
            vinList.push(this.vServiceData[this.checkList[j]].vin);
          }
          const data = {
            vins: vinList,
            type: '1',
            confId: ''
          };
          this.cityService.changeVservice(data).subscribe(resData => {
            if (resData.Code === 0) {
              this.messageService.showAlertMessage(this.translate.instant("zantingchenggong"), this.translate.instant("zantingfuwuchenggong"), 'success');
              this.checkList = [];
              this.reGetData();
            } else {
              this.messageService.showAlertMessage(this.translate.instant("zantingshibai"), resData.Message, 'error');
            }
          });
        }
      });
    } else {
      this.messageService.showAlertMessage(this.translate.instant("qingxuanzecheliang"), this.translate.instant("qingxuanzecheliang"), 'error');
    }
  }
  public replayService() {
    if (this.checkList.length !== 0) {
      this.modalService.success({
        nzTitle: this.translate.instant("querenyaojiangfuwuzhuangtaigaiwei\u201Cshenhetongguo\u201D\uFF1F"),
        nzContent: this.translate.instant("shenhetongguozhuangtai\uFF0Ccheliangjiangzhengchangxiangshoufuwu\uFF0Cquerentijiaoqingdianji\"queding\"anjian\u3002"),
        nzCancelText: this.translate.instant("quxiao"),
        nzOnOk: () => {
          const vinList = [];
          for (let j = 0; j < this.checkList.length; j++) {
            vinList.push(this.vServiceData[this.checkList[j]].vin);
          }
          const data = {
            vins: vinList,
            type: '2',
            confId: ''
          };
          this.cityService.changeVservice(data).subscribe(resData => {
            if (resData.Code === 0) {
              this.messageService.showAlertMessage(this.translate.instant("huifuchenggong"), this.translate.instant("huifufuwuchenggong"), 'success');
              this.checkList = [];
              this.reGetData();
            } else {
              this.messageService.showAlertMessage(this.translate.instant("huifushibai"), resData.Message, 'error');
            }
          });
        }
      });
    } else {
      this.messageService.showAlertMessage(this.translate.instant("qingxuanzecheliang"), this.translate.instant("qingxuanzecheliang"), 'error');
    }
  }
  getVsDetail = () => {
    const data = {
      vin: this.serviceDetail,
      rows: this.detailTableConfig.pageSize,
      page: this.detailTableConfig.pageNum
    };
    this.cityService.getVserviceDetail(data).subscribe(resData => {
      if (resData.Code === 0) {
        const res = resData.Value.data;
        for (let i = 0; i < res.length; i++) {
          if (res[i].opType === '5') {
            res[i].opType = 'zidongshenhe';
          }
          if (res[i].opType === '51') {
            res[i].opType = 'rengongshenhe';
          }
        }
        this.vServiceDetail = res;
        this.detailTableConfig.total = resData.Value.total;
      }
    });
  };
  public readAuth(row) {
    this.serviceDetail = row.vin;
    this.tabIndex = 1;
    this.tabPage = TabPage.ReadAuth;
    this.getVsDetail();
  }
  public editAuth(id) {
    this.curRoleId = id;
    this.tabIndex = 1;
    this.tabPage = TabPage.EditAuth;
  }
  public goBack() {
    this.tabIndex = 0;
    this.tabPage = TabPage.InitPage;
  }
  onSelectedAll($event: CvppTableNs.SelectedChange[]) {
    $event.forEach(item => this.onSelectedChange(item));
  }
  public onSelectedChange(event: CvppTableNs.SelectedChange) {
    if (event.type === 0) {
      this.checkList.push(event.index);
    } else {
      for (let i = 0; i < this.checkList.length; i++) {
        if (event.index === this.checkList[i]) {
          this.checkList.splice(i, 1);
        }
      }
    }
  }
  ngOnInit() {
    this.detailTableConfig = {
      checkAll: false,
      disabledCheckAll: true,
      showCheckbox: false,
      showPagination: true,
      pageNum: 1,
      pageSize: 10,
      total: 0,
      pageSizeOptions: [10, 20, 30, 40, 50],
      loading: false,
      yScroll: 0,
      headers: [{
        title: this.translate.instant("xuhao"),
        field: 'seq',
        width: 100
      }, {
        title: this.translate.instant("VINhao"),
        field: 'vin',
        width: 200,
        encryptionConfig: {
          enable: true
        },
        pipe: `encryption:`
      }, {
        title: this.translate.instant("suozaichengshi"),
        field: 'cityName',
        width: 100
      }, {
        title: this.translate.instant("fuwushenqingshijian"),
        field: 'reqTime',
        width: 180,
        pipe: dateFormat
      }, {
        title: this.translate.instant("fuwukaishishijian"),
        field: 'startTime',
        width: 180,
        pipe: dateFormat
      }, {
        title: this.translate.instant("fuwujieshushijian"),
        field: 'endTime',
        width: 180,
        pipe: dateFormat
      }, {
        title: this.translate.instant("fuwugengxinshijian"),
        field: 'opTime',
        width: 180,
        pipe: dateFormat
      }, {
        title: this.translate.instant("TnCshouquandaoqishijian"),
        field: 'tncExpireTime',
        width: 180,
        pipe: dateFormat
      }, {
        title: this.translate.instant("celvemingcheng"),
        field: 'stratName',
        width: 100
      }, {
        title: this.translate.instant("fuwuzhuangtai"),
        field: 'status',
        width: 200,
        tdTemplate: this.status
      }, {
        title: this.translate.instant("shenhefangshi"),
        field: 'opType',
        width: 200
      }, {
        title: this.translate.instant("beizhu"),
        field: 'remark',
        width: 200
      }]
    };
    this.roleTableConfig = {
      checkAll: false,
      disabledCheckAll: false,
      showCheckbox: true,
      showPagination: true,
      pageNum: 1,
      pageSize: 10,
      total: 0,
      pageSizeOptions: [10, 20, 30, 40, 50],
      loading: false,
      yScroll: 0,
      headers: [{
        title: this.translate.instant("xuhao"),
        field: 'seq',
        width: 50,
        fixed: true
      }, {
        title: this.translate.instant("VINhao"),
        field: 'vin',
        width: 200,
        fixed: true,
        encryptionConfig: {
          enable: true
        },
        pipe: `encryption:`
      }, {
        title: this.translate.instant("suozaichengshi"),
        field: 'cityName',
        width: 120
      }, {
        title: 'Program',
        field: 'program',
        width: 120
      }, {
        title: this.translate.instant("chexing"),
        field: 'model',
        width: 120
      }, {
        title: this.translate.instant("IVIpici"),
        field: 'iviVersion',
        width: 120
      }, {
        title: this.translate.instant("fuwushenqingshijian"),
        field: 'reqTime',
        width: 200,
        pipe: dateFormat
      }, {
        title: this.translate.instant("fuwukaishishijian"),
        field: 'startTime',
        width: 200,
        pipe: dateFormat
      }, {
        title: this.translate.instant("fuwujieshushijian"),
        field: 'endTime',
        width: 200,
        pipe: dateFormat
      }, {
        title: this.translate.instant("TnCshouquandaoqishijian"),
        field: 'tncExpireTime',
        width: 200,
        pipe: dateFormat
      }, {
        title: this.translate.instant("celvemingcheng"),
        field: 'stratName',
        width: 120
      }, {
        title: this.translate.instant("fuwuzhuangtai"),
        field: 'status',
        width: 120,
        tdTemplate: this.status
      }, {
        title: this.translate.instant("shenhefangshi"),
        field: 'checkSts',
        width: 120,
        tdTemplate: this.checkSts
      }, {
        title: this.translate.instant("caozuo"),
        field: '',
        fixed: true,
        width: 120,
        tdTemplate: this.roleTableOpTpl
      }]
    };
    this.programList$ = this.programService.getProgramList(true).pipe(pluck('Value'));
    this.modelList$ = this.programService.getModelList(true).pipe(pluck('Value'));
    this.iviVersionList$ = this.cityService.getIviVersionList(true).pipe(pluck('Value'));
    this.getVserviceList();
    this.cityListByProCode$ = this.roleConfigForm.controls['proCode'].valueChanges.pipe(tap(console.log), tap(_ => {
      console.log(this.roleConfigForm.controls['proCode']);
      this.roleConfigForm.controls['cityCode'].reset();
    }), switchMap(proCode => this.mapService.getCityListByProCode(proCode ? [proCode] : this.proList.map(p => p.value))), switchMap(cityList => this.mapService.getBaiduCityList().pipe(pluck('Value'), map(citys => citys.map(c => c.cityCode.toString())), map(citys => {
      return cityList.filter(c => citys.indexOf(c.cityCode) >= 0);
    }))), tap(citys => this.cityList = citys.map(c => c.cityCode)), map(cityList => cityList.map(city => ({
      label: city.cityName,
      value: city.cityCode
    }))), startWith([]));
    this.proListByProCode$ = this.mapService.getBaiduCityList().pipe(pluck('Value'), map(citys => citys.map(c => c.cityCode.toString())), switchMap(citys => this.mapService.getBaiduCityGroupList().pipe(map(proList => {
      console.log(proList, citys);
      return proList.filter(pro => pro.cities.filter(c => citys.indexOf(c.cityCode) >= 0).length > 0);
    }))), map((value: BaiduCityProSingle[]) => value.map(p => ({
      label: p.proName,
      value: p.proCode
    }))), tap(list => this.proList = list), delay(100), tap(_ => {
      this.roleConfigForm.patchValue({
        proCode: ''
      });
    }));
  }
  onExport(doDownLoad: DownloadFun) {
    if (!this.EnableExport) {
      return;
    }
    this.exportParam = this.cvppUtilService.formatExportReqData(this.exportParam);
    setTimeout(() => {
      doDownLoad();
    }, 3000);
  }
  updateSelectedHeader($event: CvppTableNs.TableHeader<any>[]) {
    this.roleTableConfig.headers = $event;
    this.roleTableConfig = {
      ...this.roleTableConfig
    };
  }
  isNullable(value) {
    return typeof value !== 'undefined' && value !== null;
  }
}