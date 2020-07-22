import { Version } from "@microsoft/sp-core-library";
import {
  IPropertyPaneConfiguration,
  PropertyPaneTextField,
} from "@microsoft/sp-property-pane";
import { BaseClientSideWebPart } from "@microsoft/sp-webpart-base";
import { escape } from "@microsoft/sp-lodash-subset";

//import styles from './RequestDashboardWebPart.module.scss';
import * as strings from "RequestDashboardWebPartStrings";

import { SPComponentLoader } from "@microsoft/sp-loader";

import "jquery";
import * as moment from "moment";
import "datatables";
import { sp } from "@pnp/pnpjs";
import "@pnp/polyfill-ie11";

import "../../ExternalRef/css/style.css";
import "../../ExternalRef/css/alertify.min.css";
import "../../ExternalRef/css/bootstrap-datepicker.min.css";
import "../../ExternalRef/js/bootstrap-datepicker.min.js";
import "../../ExternalRef/js/bootstrap.min.js";
import "../../../node_modules/datatables/media/css/jquery.dataTables.min.css";
var alertify: any = require("../../ExternalRef/js/alertify.min.js");

SPComponentLoader.loadCss(
  "https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css"
);

declare var $;
var siteURL = "";
var arrEAandEIS = [];
var arrCERecords = [];
var arrHistroy = [];

export interface IRequestDashboardWebPartProps {
  description: string;
}

export default class RequestDashboardWebPart extends BaseClientSideWebPart<
  IRequestDashboardWebPartProps
> {
  public onInit(): Promise<void> {
    return super.onInit().then((_) => {
      sp.setup({
        spfxContext: this.context,
      });
    });
  }

  public render(): void {
    siteURL = this.context.pageContext.site.absoluteUrl;
    this.domElement.innerHTML = `
    <div class="loading-modal"> 
    <div class="spinner-border" role="status"> 
    <span class="sr-only">Loading...</span>
    </div>
    </div>
    <ul class="nav nav-tabs">
    <li class="active"><a href="#home" data-toggle="tab">EA and EIS</a></li>
    <li><a href="#menu1" data-toggle="tab">CE Record</a></li>
    <li><a href="#menu2" data-toggle="tab">NEPA Graveyard</a></li>
    </ul>
    <div class='tab-content'> 
    <div id='home' class='tab-pane fade in active tab-panel'>
    
    <div class='btnDiv'> 
    <div>
    <input class="btn btn-primary" type='button' id='btnEAandEIS' value='Create EA and EIS'>
    </div>
    </div>
    
    <div id='EAandEISTable'>
    <table id="tblEAandEIS" style="width:100%">
    <thead>
    <tr>
    <th>Id</th>
    <th>Subject</th>
    <th>Subject Detail</th>
    <th>New Target Date for Public Review</th>
    <th>New Target Decision Date</th> 
    <th>Decision Date</th>
    <th>Priority Rank</th>
    <th>Type</th>
    <th>Status </th>
    <th>Last MR </th>
    <th>Species </th>
    <th>Actions </th>
    </tr>
    </thead>
    <tbody id='tblbodyEAandEISTable'>
    </tbody>
    </table>
    </div> 
    </div> 
    
    <div id='menu1' class='tab-pane fade tab-panel'>    
    
    <div class='btnDiv'>
    <div>
    <input class="btn btn-primary" type='button' id='btnCERec' value='Create CE Records'>
    </div>
    </div>
   
    <div id='CERecordsTable'>
    <table id="tblCERecords"  style="width:100%">
    <thead>
    <tr>
    <th>Id</th>
    <th>Region</th>
    <th>State</th>
    <th>CE signature date</th>
    <th>Project end date</th>
    <th>FY</th>
    <th>Group</th>
    <th>Actions</th>
    </tr>
    </thead>
    <tbody id='tblbodyCERecords'>
    </tbody>
    </table>
    </div>
    
    </div>
    
    <div id='menu2' class='tab-pane fade tab-panel'>    
    
    <div class='btnDiv'>
    <div>
    <input class="btn btn-primary" type='button' id='btnHtyDocs' value='Create Graveyard'>
    </div>
    </div>
   
    <div id='HstryDocs'>
    <table id="tblHistroy"  style="width:100%">
    <thead>
    <tr>
    <th>Id</th>
    <th>Name</th>
    <th>Reason</th>
    <th>ROD date</th>
    <th>End Date</th>
    <th>Actions</th>
    </tr>
    </thead>
    <tbody id='tblbodyHistroy'>
    </tbody>
    </table>
    </div>
    
    </div> 
    
    
    </div>
    
    
    <div class="modal fade" id="myModal" role="dialog">
    <div class="modal-dialog">
    
      <!-- Modal content-->
      <div class="modal-content">
        <div class="modal-header">
          <button type="button" class="close" data-dismiss="modal">&times;</button>
          <h4 class="modal-title" id='ProjectDetails'>NEPA - Request</h4>
        </div>
        <div class="modal-body" id='modalbody'>
          <p>Some text in the modal.</p>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-default" data-dismiss="modal">Close</button>
        </div>
      </div>
      
    </div>
  </div>
    `;

    $(".loading-modal").addClass("active");
    $("body").addClass("body-hidden");

    fetchEAandEIS();
    fetchCERecords();
    fetchHistroyDocs();

    /* $('.loading-modal').removeClass('active');
    $('body').removeClass('body-hidden');*/

    $("#btnEAandEIS").click(function () {
      location.href = siteURL + "/SitePages/NewRequest.aspx?code=EA";
    });
    $("#btnCERec").click(function () {
      location.href = siteURL + "/SitePages/NewRequest.aspx?code=CE";
    });
    $("#btnHtyDocs").click(function () {
      location.href = siteURL + "/SitePages/NewRequest.aspx?code=HT";
    });

    $(document).on("click", ".EAandEISEdit", function () {
      location.href =
        siteURL +
        "/SitePages/EditRequest.aspx?ItemId=" +
        $(this).attr("req-id") +
        "&code=EA";
    });

    $(document).on("click", ".CERecEdit", function () {
      location.href =
        siteURL +
        "/SitePages/EditRequest.aspx?ItemId=" +
        $(this).attr("req-id") +
        "&code=CE";
    });

    $(document).on("click", ".HTEdit", function () {
      location.href =
        siteURL +
        "/SitePages/EditRequest.aspx?ItemId=" +
        $(this).attr("req-id") +
        "&code=HT";
    });

    $(document).on("click", ".EAandEISView", function () {
      var that = $(this);
      var index;

      arrEAandEIS.forEach(function (val, key) {
        if (val.ID == that.attr("req-id")) {
          index = key;
        }
      });

      if (
        !arrEAandEIS[index].PriorityRank ||
        arrEAandEIS[index].PriorityRank == "Select"
      )
        arrEAandEIS[index].PriorityRank = "";

      if (
        !arrEAandEIS[index].TypeofNepa ||
        arrEAandEIS[index].TypeofNepa == "Select"
      )
        arrEAandEIS[index].TypeofNepa = "";

      if (!arrEAandEIS[index].Status || arrEAandEIS[index].Status == "Select")
        arrEAandEIS[index].Status = "";

      if (!arrEAandEIS[index].LastMR) arrEAandEIS[index].LastMR = "";

      if (!arrEAandEIS[index].Species) arrEAandEIS[index].Species = "";

      if (!arrEAandEIS[index].Subject) arrEAandEIS[index].Subject = "";

      if (!arrEAandEIS[index].Subjectdetail)
        arrEAandEIS[index].Subjectdetail = "";

      let HTMLGoods = "";

      HTMLGoods +=
        '<div class="row goods-details"><div class="col-sm-3"><h5 class="goods-label">ID</h5></div><div class="col-sm-1 text-center">:</div><div class="col-sm-6"><p class="goodsresult">' +
        arrEAandEIS[index].ID +
        "</p></div></div>";
      HTMLGoods +=
        '<div class="row goods-details"><div class="col-sm-3"><h5 class="goods-label">PriorityRank</h5></div><div class="col-sm-1 text-center">:</div><div class="col-sm-6"><p class="goodsresult">' +
        arrEAandEIS[index].PriorityRank +
        "</p></div></div>";
      HTMLGoods +=
        '<div class="row goods-details"><div class="col-sm-3"><h5 class="goods-label">TypeofNepa</h5></div><div class="col-sm-1 text-center">:</div><div class="col-sm-6"><p class="goodsresult">' +
        arrEAandEIS[index].TypeofNepa +
        "</p></div></div>";
      HTMLGoods +=
        '<div class="row goods-details"><div class="col-sm-3"><h5 class="goods-label">Status</h5></div><div class="col-sm-1 text-center">:</div><div class="col-sm-6"><p class="goodsresult">' +
        arrEAandEIS[index].Status +
        "</p></div></div>";
      HTMLGoods +=
        '<div class="row goods-details"><div class="col-sm-3"><h5 class="goods-label">ReviewDate</h5></div><div class="col-sm-1 text-center">:</div><div class="col-sm-6"><p class="goodsresult">' +
        moment(arrEAandEIS[index].ReviewDate).format("MM/DD/YYYY") +
        "</p></div></div>";
      HTMLGoods +=
        '<div class="row goods-details"><div class="col-sm-3"><h5 class="goods-label">DecisionDate</h5></div><div class="col-sm-1 text-center">:</div><div class="col-sm-6"><p class="goodsresult">' +
        moment(arrEAandEIS[index].DecisionDate).format("MM/DD/YYYY") +
        "</p></div></div>";
      HTMLGoods +=
        '<div class="row goods-details"><div class="col-sm-3"><h5 class="goods-label">TargetDecisionDate</h5></div><div class="col-sm-1 text-center">:</div><div class="col-sm-6"><p class="goodsresult">' +
        moment(arrEAandEIS[index].TargetDecisionDate).format("MM/DD/YYYY") +
        "</p></div></div>";
      HTMLGoods +=
        '<div class="row goods-details"><div class="col-sm-3"><h5 class="goods-label">LastMR</h5></div><div class="col-sm-1 text-center">:</div><div class="col-sm-6"><p class="goodsresult">' +
        arrEAandEIS[index].LastMR +
        "</p></div></div>";
      HTMLGoods +=
        '<div class="row goods-details"><div class="col-sm-3"><h5 class="goods-label">Species</h5></div><div class="col-sm-1 text-center">:</div><div class="col-sm-6"><p class="goodsresult">' +
        arrEAandEIS[index].Species +
        "</p></div></div>";
      HTMLGoods +=
        '<div class="row goods-details"><div class="col-sm-3"><h5 class="goods-label">Subject</h5></div><div class="col-sm-1 text-center">:</div><div class="col-sm-6"><p class="goodsresult">' +
        arrEAandEIS[index].Subject +
        "</p></div></div>";
      HTMLGoods +=
        '<div class="row goods-details"><div class="col-sm-3"><h5 class="goods-label">Subjectdetail</h5></div><div class="col-sm-1 text-center">:</div><div class="col-sm-6"><p class="goodsresult">' +
        arrEAandEIS[index].Subjectdetail +
        "</p></div></div>";
      HTMLGoods +=
        '<div class="row goods-details"><div class="col-sm-3"><h5 class="goods-label">Feralswine</h5></div><div class="col-sm-1 text-center">:</div><div class="col-sm-6"><p class="goodsresult">' +
        arrEAandEIS[index].Feralswine +
        "</p></div></div>";
      HTMLGoods +=
        '<div class="row goods-details"><div class="col-sm-3"><h5 class="goods-label">Decision Maker</h5></div><div class="col-sm-1 text-center">:</div><div class="col-sm-6"><p class="goodsresult">' +
        arrEAandEIS[index].DecisionMaker +
        "</p></div></div>";
      HTMLGoods +=
        '<div class="row goods-details"><div class="col-sm-3"><h5 class="goods-label">EA or EIS</h5></div><div class="col-sm-1 text-center">:</div><div class="col-sm-6"><p class="goodsresult">' +
        arrEAandEIS[index].EAorEIS +
        "</p></div></div>";
      HTMLGoods +=
        '<div class="row goods-details"><div class="col-sm-3"><h5 class="goods-label">EC</h5></div><div class="col-sm-1 text-center">:</div><div class="col-sm-6"><p class="goodsresult">' +
        arrEAandEIS[index].EC +
        "</p></div></div>";
      HTMLGoods +=
        '<div class="row goods-details"><div class="col-sm-3"><h5 class="goods-label">State</h5></div><div class="col-sm-1 text-center">:</div><div class="col-sm-6"><p class="goodsresult">' +
        arrEAandEIS[index].State +
        "</p></div></div>";

      /*if(arrEAandEIS[index].DecisionMaker)
      {
      for(var i=0;i<arrEAandEIS[index].DecisionMaker.length;i++)
      {
        HTMLGoods+='<div class="row goods-details">';

        if(i==0)
        HTMLGoods+='<div class="col-sm-3"><h5 class="goods-label">Decision Maker</h5></div>';
        else
        HTMLGoods+='<div class="col-sm-3"><h5 class="goods-label"></h5></div>';

        HTMLGoods+='<div class="col-sm-1 text-center">:</div><div class="col-sm-6"><p class="goodsresult">'+arrEAandEIS[index].DecisionMaker[i]+'</p></div></div>';
      }
      }

      if(arrEAandEIS[index].EAorEIS)
      {
      for(var i=0;i<arrEAandEIS[index].EAorEIS.length;i++)
      {
        HTMLGoods+='<div class="row goods-details">';
        if(i==0)
        HTMLGoods+='<div class="col-sm-3"><h5 class="goods-label">EA or EIS</h5></div>';
        else
        HTMLGoods+='<div class="col-sm-3"><h5 class="goods-label"></h5></div>';

        HTMLGoods+='<div class="col-sm-1 text-center">:</div><div class="col-sm-6"><p class="goodsresult">'+arrEAandEIS[index].EAorEIS[i]+'</p></div></div>';
      }
      }


      if(arrEAandEIS[index].EC)
      {
      for(var i=0;i<arrEAandEIS[index].EC.length;i++)
      {
        HTMLGoods+='<div class="row goods-details">';
        
        if(i==0)
        HTMLGoods+='<div class="col-sm-3"><h5 class="goods-label">EC</h5></div>';
        else
        HTMLGoods+='<div class="col-sm-3"><h5 class="goods-label"></h5></div>';

        HTMLGoods+='<div class="col-sm-1 text-center">:</div><div class="col-sm-6"><p class="goodsresult">'+arrEAandEIS[index].EC[i]+'</p></div></div>';
      }
      }

      if(arrEAandEIS[index].State)
      {
      for(var i=0;i<arrEAandEIS[index].State.length;i++)
      {
        HTMLGoods+='<div class="row goods-details">';

        if(i==0)
        HTMLGoods+='<div class="col-sm-3"><h5 class="goods-label">State</h5></div>';
        else
        HTMLGoods+='<div class="col-sm-3"><h5 class="goods-label"></h5></div>';

        HTMLGoods+='<div class="col-sm-1 text-center">:</div><div class="col-sm-6"><p class="goodsresult">'+arrEAandEIS[index].State[i]+'</p></div></div>';
      }
      }*/
      $("#ProjectDetails").text("EA and EIS Record");

      $("#modalbody").html("");
      $("#modalbody").append(HTMLGoods);
    });

    $(document).on("click", ".CEView", function () {
      var that = $(this);
      var index;

      arrCERecords.forEach(function (val, key) {
        if (val.ID == that.attr("req-id")) {
          index = key;
        }
      });

      if (!arrCERecords[index].arrCERecords)
        arrCERecords[index].arrCERecords = "";

      if (!arrCERecords[index].State) arrCERecords[index].State = "";

      if (!arrCERecords[index].FY) arrCERecords[index].FY = "";

      if (!arrCERecords[index].Group) arrCERecords[index].Group = "";

      let HTMLGoods = "";

      HTMLGoods +=
        '<div class="row goods-details"><div class="col-sm-3"><h5 class="goods-label">ID</h5></div><div class="col-sm-1 text-center">:</div><div class="col-sm-6"><p class="goodsresult">' +
        arrCERecords[index].ID +
        "</p></div></div>";
      HTMLGoods +=
        '<div class="row goods-details"><div class="col-sm-3"><h5 class="goods-label">Region</h5></div><div class="col-sm-1 text-center">:</div><div class="col-sm-6"><p class="goodsresult">' +
        arrCERecords[index].Region +
        "</p></div></div>";
      HTMLGoods +=
        '<div class="row goods-details"><div class="col-sm-3"><h5 class="goods-label">State</h5></div><div class="col-sm-1 text-center">:</div><div class="col-sm-6"><p class="goodsresult">' +
        arrCERecords[index].State +
        "</p></div></div>";
      HTMLGoods +=
        '<div class="row goods-details"><div class="col-sm-3"><h5 class="goods-label">CESignDate</h5></div><div class="col-sm-1 text-center">:</div><div class="col-sm-6"><p class="goodsresult">' +
        moment(arrCERecords[index].CESignDate).format("MM/DD/YYYY") +
        "</p></div></div>";
      HTMLGoods +=
        '<div class="row goods-details"><div class="col-sm-3"><h5 class="goods-label">PjctEndDate</h5></div><div class="col-sm-1 text-center">:</div><div class="col-sm-6"><p class="goodsresult">' +
        moment(arrCERecords[index].PjctEndDate).format("MM/DD/YYYY") +
        "</p></div></div>";
      HTMLGoods +=
        '<div class="row goods-details"><div class="col-sm-3"><h5 class="goods-label">FY</h5></div><div class="col-sm-1 text-center">:</div><div class="col-sm-6"><p class="goodsresult">' +
        arrCERecords[index].FY +
        "</p></div></div>";
      HTMLGoods +=
        '<div class="row goods-details"><div class="col-sm-3"><h5 class="goods-label">Group</h5></div><div class="col-sm-1 text-center">:</div><div class="col-sm-6"><p class="goodsresult">' +
        arrCERecords[index].Group +
        "</p></div></div>";

      $("#ProjectDetails").text("CE Record");
      $("#modalbody").html("");
      $("#modalbody").append(HTMLGoods);
    });

    $(document).on("click", ".HTView", function () {
      var that = $(this);
      var index;

      arrHistroy.forEach(function (val, key) {
        if (val.ID == that.attr("req-id")) {
          index = key;
        }
      });

      if (!arrHistroy[index].Reason) arrHistroy[index].Reason = "";

      if (!arrHistroy[index].Roddate) arrHistroy[index].Roddate = "";

      if (!arrHistroy[index].Enddate) arrHistroy[index].Enddate = "";

      var Name = arrHistroy[index].EncodedAbsUrl.split("/");
      var filename = Name[Name.length - 1];

      let HTMLGoods = "";

      HTMLGoods +=
        '<div class="row goods-details"><div class="col-sm-3"><h5 class="goods-label">File Name</h5></div><div class="col-sm-1 text-center">:</div><div class="col-sm-6"><p class="goodsresult"><a href="' +
        arrHistroy[index].EncodedAbsUrl +
        '">' +
        decodeURIComponent(filename) +
        "</a></p></div></div>";
      HTMLGoods +=
        '<div class="row goods-details"><div class="col-sm-3"><h5 class="goods-label">Reason</h5></div><div class="col-sm-1 text-center">:</div><div class="col-sm-6"><p class="goodsresult">' +
        arrHistroy[index].Reason +
        "</p></div></div>";
      HTMLGoods +=
        '<div class="row goods-details"><div class="col-sm-3"><h5 class="goods-label">Rod Date</h5></div><div class="col-sm-1 text-center">:</div><div class="col-sm-6"><p class="goodsresult">' +
        moment(arrHistroy[index].Roddate).format("MM/DD/YYYY") +
        "</p></div></div>";
      HTMLGoods +=
        '<div class="row goods-details"><div class="col-sm-3"><h5 class="goods-label">End Date</h5></div><div class="col-sm-1 text-center">:</div><div class="col-sm-6"><p class="goodsresult">' +
        moment(arrHistroy[index].Enddate).format("MM/DD/YYYY") +
        "</p></div></div>";

      $("#ProjectDetails").text("NEPA Graveyard");

      $("#modalbody").html("");
      $("#modalbody").append(HTMLGoods);
    });
  }

  protected get dataVersion(): Version {
    return Version.parse("1.0");
  }

  protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
    return {
      pages: [
        {
          header: {
            description: strings.PropertyPaneDescription,
          },
          groups: [
            {
              groupName: strings.BasicGroupName,
              groupFields: [
                PropertyPaneTextField("description", {
                  label: strings.DescriptionFieldLabel,
                }),
              ],
            },
          ],
        },
      ],
    };
  }
}

function datediffernce(fromdate, todate) {
  var From_date = new Date(fromdate);
  var To_date = new Date(todate);

  var diff_date = (todate - fromdate) / 86400000;

  return diff_date;
}

async function fetchEAandEIS() {
  await sp.web.lists
    .getByTitle("NepaRequest")
    .items.get()
    .then((items: any[]) => {
      arrEAandEIS = items;

      var html = "";
      for (var i = 0; i < items.length; i++) {
        var reviewdate = "ClsEmpty";
        var tgetdecdate = "ClsEmpty";

        var todaydate = moment().format("MM/DD/YYYY");
        var todayisodate = moment().format();

        if (items[i].ReviewDate) {
          if (items[i].ReviewDate < todayisodate) {
            //var differnceofdays=datediffernce(moment(items[i].ReviewDate).format("MM/DD/YYYY"),todaydate);
            var differnceofdays = datediffernce(
              new Date(moment(items[i].ReviewDate).format("MM/DD/YYYY")),
              new Date()
            );
            if (differnceofdays < 30) reviewdate = "Clsgreen";
            else if (differnceofdays > 30 && differnceofdays < 60)
              reviewdate = "Clsyellow";
            else reviewdate = "ClsRed";
          } else {
            reviewdate = "Clsgreen";
          }
        }

        if (items[i].TargetDecisionDate) {
          if (items[i].TargetDecisionDate < todayisodate) {
            //var differnceofdays=datediffernce(moment(items[i].TargetDecisionDate).format("MM/DD/YYYY"),todaydate);
            var differnceofdays = datediffernce(
              new Date(
                moment(items[i].TargetDecisionDate).format("MM/DD/YYYY")
              ),
              new Date()
            );

            if (differnceofdays < 30) tgetdecdate = "Clsgreen";
            else if (differnceofdays > 30 && differnceofdays < 60)
              tgetdecdate = "Clsyellow";
            else tgetdecdate = "ClsRed";
          } else {
            tgetdecdate = "Clsgreen";
          }
        }

        html += "<tr>";
        html += "<td>" + items[i].ID + "</td>";
        html += "<td>" + items[i].Subject + "</td>";
        html += "<td>" + items[i].Subjectdetail + "</td>";
        html +=
          "<td class=" +
          reviewdate +
          ">" +
          moment(items[i].ReviewDate).format("DD/MM/YYYY") +
          "</td>";
        html +=
          "<td class=" +
          tgetdecdate +
          ">" +
          moment(items[i].TargetDecisionDate).format("DD/MM/YYYY") +
          "</td>";
        html +=
          "<td>" + moment(items[i].DecisionDate).format("DD/MM/YYYY") + "</td>";
        html += "<td>" + items[i].PriorityRank + "</td>";
        html += "<td>" + items[i].TypeofNepa + "</td>";
        html += "<td>" + items[i].Status + "</td>";
        html += "<td>" + items[i].LastMR + "</td>";
        html += "<td>" + items[i].Species + "</td>";
        html += "<td>";
        html +=
          ' <a herf="#" req-id="' +
          items[i].ID +
          '" class="EAandEISView" data-toggle="modal" data-target="#myModal"><span class="icon-action icon-view"></a>';
        html +=
          '<a herf="#" req-id="' +
          items[i].ID +
          '" index-value=' +
          i +
          ' class="EAandEISEdit"><span class="icon-action icon-edit"></a>';
        html += "</td>";
        html += "</tr>";
      }

      $("#tblbodyEAandEISTable").html("");
      $("#tblbodyEAandEISTable").html(html);
    })
    .catch(function (error) {
      ErrorCallBack(error, "fetchEAandEIS");
    });

  $("#tblEAandEIS").DataTable({
    order: [[0, "desc"]],
    scrollX: true,
    columnDefs: [
      {
        targets: [0],
        visible: false,
      },
    ],
    language: {
      paginate: {
        next: ">", // or '→'
        previous: "<", // or '←'
      },
    },
  });

  $("td").each(function () {
    if ($(this).text() == "null" || $(this).text() == "Select") {
      $(this).text("N/A");
    }
  });
}

async function fetchCERecords() {
  await sp.web.lists
    .getByTitle("CERecords")
    .items.get()
    .then((items: any[]) => {
      arrCERecords = items;

      var html = "";
      for (var i = 0; i < items.length; i++) {
        html += "<tr>";
        html += "<td>" + items[i].ID + "</td>";
        html += "<td>" + items[i].Region + "</td>";
        html += "<td>" + items[i].State + "</td>";
        html +=
          "<td>" + moment(items[i].CESignDate).format("DD/MM/YYYY") + "</td>";
        html +=
          "<td>" + moment(items[i].PjctEndDate).format("DD/MM/YYYY") + "</td>";
        html += "<td>" + items[i].FY + "</td>";
        html += "<td>" + items[i].Group + "</td>";
        html += "<td>";
        html +=
          ' <a herf="#" req-id="' +
          items[i].ID +
          '" class="CEView" data-toggle="modal" data-target="#myModal"><span class="icon-action icon-view"></a>';
        html +=
          '<a herf="#" req-id="' +
          items[i].ID +
          '" index-value=' +
          i +
          ' class="CERecEdit"><span class="icon-action icon-edit"></a>';
        html += "</td>";
        html += "</tr>";
      }

      $("#tblbodyCERecords").html("");
      $("#tblbodyCERecords").html(html);
    })
    .catch(function (error) {
      ErrorCallBack(error, "fetchCERecords");
    });

  $("#tblCERecords").DataTable({
    order: [[0, "desc"]],
    //"scrollX": true,
    columnDefs: [
      {
        targets: [0],
        visible: false,
      },
    ],
    language: {
      paginate: {
        next: ">", // or '→'
        previous: "<", // or '←'
      },
    },
  });

  $("td").each(function () {
    if ($(this).text() == "null" || $(this).text() == "Select") {
      $(this).text("N/A");
    }
  });
}

async function fetchHistroyDocs() {
  /*await sp.web.folders.getByName("HistroyDocuments").files.get().then(function(data)
  {
      console.log(data);
  }).catch(function(error){ErrorCallBack(error,'fetchHistroyDocs')});*/

  await sp.web.lists
    .getByTitle("HistroyDocuments")
    .items.select("ID,EncodedAbsUrl,Reason,Roddate,Enddate")
    .get()
    .then(function (items) {
      arrHistroy = items;
      var html = "";
      for (var i = 0; i < items.length; i++) {
        var Name = items[i].EncodedAbsUrl.split("/");
        var filename = Name[Name.length - 1];

        html += "<tr>";
        html += "<td>" + items[i].ID + "</td>";
        html +=
          '<td><a href="' +
          items[i]["EncodedAbsUrl"] +
          '">' +
          decodeURIComponent(filename) +
          "</a></td>";

        html += "<td>" + items[i].Reason + "</td>";
        html +=
          "<td>" + moment(items[i].Roddate).format("DD/MM/YYYY") + "</td>";
        html +=
          "<td>" + moment(items[i].Enddate).format("DD/MM/YYYY") + "</td>";
        html += "<td>";
        html +=
          ' <a herf="#" req-id="' +
          items[i].ID +
          '" class="HTView" data-toggle="modal" data-target="#myModal"><span class="icon-action icon-view"></a>';
        html +=
          '<a herf="#" req-id="' +
          items[i].ID +
          '" index-value=' +
          i +
          ' class="HTEdit"><span class="icon-action icon-edit"></a>';
        html += "</td>";
        html += "</tr>";
      }

      $("#tblbodyHistroy").html("");
      $("#tblbodyHistroy").html(html);
    })
    .catch(function (error) {
      ErrorCallBack(error, "fetchHistroyDocs");
    });

  $("#tblHistroy").DataTable({
    order: [[0, "desc"]],
    //"scrollX": true,
    columnDefs: [
      {
        targets: [0],
        visible: false,
      },
    ],
    language: {
      paginate: {
        next: ">", // or '→'
        previous: "<", // or '←'
      },
    },
  });

  $(".loading-modal").removeClass("active");
  $("body").removeClass("body-hidden");
}

function AlertMessage(strMewssageEN) {
  alertify
    .alert()
    .setting({
      label: "OK",

      message: strMewssageEN,

      onok: function () {
        window.location.href = "#";
      },
    })
    .show()
    .setHeader("<em>Confirmation</em> ")
    .set("closable", false);
}

function ErrorCallBack(error, methodname) {
  $(".loading-modal").removeClass("active");
  $("body").removeClass("body-hidden");
  alert(error + "-" + methodname);
}
