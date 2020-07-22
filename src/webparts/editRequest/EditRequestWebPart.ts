import { Version } from "@microsoft/sp-core-library";
import {
  IPropertyPaneConfiguration,
  PropertyPaneTextField,
} from "@microsoft/sp-property-pane";
import { BaseClientSideWebPart } from "@microsoft/sp-webpart-base";
import { escape } from "@microsoft/sp-lodash-subset";

import { SPComponentLoader } from "@microsoft/sp-loader";

//import styles from './EditRequestWebPart.module.scss';
import * as strings from "EditRequestWebPartStrings";

import "jquery";
import * as moment from "moment";
import { sp, ConsoleListener } from "@pnp/pnpjs";
import "@pnp/polyfill-ie11";

import "../../ExternalRef/js/jquery.multiselect.js";
import "../../ExternalRef/css/style.css";
import "../../ExternalRef/css/alertify.min.css";
import "../../ExternalRef/css/bootstrap-datepicker.min.css";
import "../../ExternalRef/css/bootstrap-multiselect.css";
import "../../ExternalRef/css/jquery.multiselect.css";
import "../../ExternalRef/js/bootstrap-datepicker.min.js";
import { TermStore } from "@pnp/sp/taxonomy";

//require('../../ExternalRef/js/jquery.multiselect.js');
var alertify: any = require("../../ExternalRef/js/alertify.min.js");

SPComponentLoader.loadCss(
  "https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css"
);
declare var $;

var siteURL = "";
var arrEC = [];
var arrstates = [];
var arrRanks = [];
var arrTypes = [];
var arrStatus = [];
var arrDesMkr = [];
var arrEAandEIS = [];

var arrRegionCE = [];
var arrStateCE = [];

var itemid;
var requestcode;

export interface IEditRequestWebPartProps {
  description: string;
}

export default class EditRequestWebPart extends BaseClientSideWebPart<
  IEditRequestWebPartProps
> {
  public onInit(): Promise<void> {
    return super.onInit().then((_) => {
      sp.setup({
        spfxContext: this.context,
      });
    });
  }

  private readonly requestoptions = `
    
  <div class="loading-modal"> 
  <div class="spinner-border" role="status"> 
  <span class="sr-only">Loading...</span>
</div></div>
  <h4 class='page-heading'>NEPA-Edit Request</h4>
  <div class="row">
  <div class="col-sm-12" style="display:none">
    <div class="form-group">
      <label>NEPA-Request Type:<span class="star"></span></label>
      <select class="form-control" id="DrpNeapRequest" disabled style="display:none"> 
        <option value="Select">Select</option>
        <option value="EAandEIS">EA and EIS</option>
        <option value="CE">CE Record</option>
        <option value="Histroy">Historical Documents</option>
        </select>
        </div>
      </div>
    </div>
    <div id='divRequest'></div>
  `;

  private readonly EAandEIS = `
  <div class="row">
  <div class="col-sm-6">
    <div class="form-group">
      <label>EC:<span class="star"></span></label>
      <select name="drpEC[]" multiple class="form-control" id="drpEC">
        <option value="Select">Select</option>
        </select>
        </div>
      </div>
      <div class="col-sm-6">
      <div class="form-group">
        <label>State:<span class="star"></span></label>
        <select name="drpState[]" multiple class="form-control" id="drpState">
          </select>
          </div>
        </div>

    </div>

    <div class="row">
    <div class="col-sm-6">
      <div class="form-group">
        <label>Decision Maker:<span class="star"></span></label>
        <select name="drpDecMkr[]" multiple class="form-control" id="drpDecMkr">
          <option value="Select">Select</option>
          </select>
          </div>
        </div>
        <div class="col-sm-6">
        <div class="form-group">
          <label>EA or  EIS :<span class="star"></span></label>
          <select name="drpEAandEIS[]" multiple class="form-control" id="drpEAandEIS">
            </select>
            </div>
          </div>
  
      </div>

    <div class="row">
    <div class="col-sm-6">
    <div class="form-group">
      <label>Subject:<span class="star"></span></label>
      <input class="form-control" type="text" id="subject" value="">
    </div>
    </div>
    <div class="col-sm-6">
    <div class="form-group">
      <label>Subject Detail:<span class="star"></span></label>
      <textarea class="form-control" id="txtsubdetls"></textarea>
    </div>
    </div>
  
      </div>

      <div class="row">
      <div class="col-sm-6">
        <div class="form-group">
          <label>Priority Rank:<span class="star"></span></label>
          <select class="form-control" id="drpPrRank">
            <option value="Select">Select</option>
            </select>
            </div>
          </div>
          <div class="col-sm-6">
          <div class="form-group">
            <label>Type:<span class="star"></span></label>
            <select class="form-control" id="drptype">
              <option value="Select">Select</option>
              </select>
              </div>
            </div>
    
        </div>

        <div class="row">
        <div class="col-sm-6">
          <div class="form-group">
            <label>Status:<span class="star"></span></label>
            <select class="form-control" id="drpstatus">
              <option value="Select">Select</option>
              </select>
              </div>
            </div>
            <div class="col-sm-6">
            <div class="form-group">
              <label>New Target Date for Public Review:<span class="star"></span></label>
              <input class="form-control form-control-datepicker" type="text" id="Reviewdate" Readonly>
                </div>
              </div>
      
          </div>

          <div class="row">
          <div class="col-sm-6">
          <div class="form-group">
            <label>New Target Decision Date:<span class="star"></span></label>
            <input class="form-control form-control-datepicker" type="text" id="Targetdate" Readonly>
              </div>
            </div>
              <div class="col-sm-6">
              <div class="form-group">
                <label>Decision Date:<span class="star"></span></label>
                <input class="form-control form-control-datepicker" type="text" id="decisiondate" Readonly>
                  </div>
                </div>
        
            </div>

            <div class="row">
            <div class="col-sm-6">
            <div class="form-group">
              <label>Last MR:<span class="star"></span></label>
              <input class="form-control" type="text" id="lastmr" value="">
            </div>
            </div>
            <div class="col-sm-6">
            <div class="form-group">
              <label>Species:<span class="star"></span></label>
              <input class="form-control" type="text" id="species" value="">
            </div>
            </div>
          
              </div>

              <div class="row">
              <div class="col-sm-6">
              <div class="form-group">
                <input class="radio-stylish" type="checkbox" id="chkswine" value="Feral swine included?">
                <span class="checkbox-element"></span>
                <label class="stylish-label" for="chkswine">Feral swine included?</label>
              </div>
              </div>
              </div>

              <div class="form-group" id='btnfinal'>
              <input class="btn btn-secondary" type="button" id="btnclose" value="Back">
              <input class="btn btn-primary" type="button" id="btnSubmit" value="Submit">
          </div>
  `;

  private readonly CERecords = `
  <div class="row">
  <div class="col-sm-6">
  <div class="form-group">
    <label>Region:<span class="star"></span></label>
    <select name="drpCERegion[]" multiple class="form-control" id="drpCERegion">
      </select>
      </div>
    </div>
    <div class="col-sm-6">
    <div class="form-group">
      <label>State:<span class="star"></span></label>
      <select name="drpCEState[]" multiple class="form-control" id="drpCEState">
        </select>
        </div>
      </div>
  </div>

<div class="row">
          <div class="col-sm-6">
          <div class="form-group">
            <label>CE signature date:<span class="star"></span></label>
            <input class="form-control form-control-datepicker" type="text" id="CESigndate" Readonly>
              </div>
            </div>
              <div class="col-sm-6">
              <div class="form-group">
                <label>Project end date:<span class="star"></span></label>
                <input class="form-control form-control-datepicker" type="text" id="prjctenddate" Readonly>
                  </div>
                </div>
        
            </div>

            <div class="row">
            <div class="col-sm-6">
            <div class="form-group">
              <label>FY:<span class="star"></span></label>
              <input class="form-control" type="text" id="txtFY" value="">
            </div>
            </div>
            <div class="col-sm-6">
            <div class="form-group">
              <label>Group:<span class="star"></span></label>
              <input class="form-control" type="text" id="txtGroup" value="">
            </div>
            </div>
            </div>

            <div class="form-group" id='btnfinal'>
            <input class="btn btn-secondary" type="button" id="btnclose" value="Back">
            <input class="btn btn-primary" type="button" id="btnSubmit" value="Submit">
        </div>
  `;

  private readonly Htmlhistory = `
  
  <div class="row">
  <div class="col-sm-6">
  <div class="form-group">
    <label>Document:<span class="star"></span></label>     
    <div class="input-group" id="filelink">

    </div>
  </div>
  </div>

  <div class="col-sm-6">
  <div class="form-group">
    <label>Reason:<span class="star"></span></label>
    <input class="form-control" type="text" id="txtreason" value="">
  </div>
  </div>

  </div>

  <div class="row">
  <div class="col-sm-6">
  <div class="form-group">
    <label>FONSI/ROD Date:<span class="star"></span></label>
    <input class="form-control form-control-datepicker" type="text" id="roddate" Readonly>
      </div>
    </div>
      <div class="col-sm-6">
      <div class="form-group">
        <label>End date:<span class="star"></span></label>
        <input class="form-control form-control-datepicker" type="text" id="txtenddate" Readonly>
          </div>
        </div>

    </div>

    <div class="form-group" id='btnfinal'>
    <input class="btn btn-secondary" type="button" id="btnclose" value="Back">
    <input class="btn btn-primary" type="button" id="btnSubmit" value="Submit">
</div>


  `;

  public render(): void {
    siteURL = this.context.pageContext.site.absoluteUrl;
    this.domElement.innerHTML = this.requestoptions;

    var that = this;

    itemid = getUrlParameter("ItemId");
    requestcode = getUrlParameter("code");

    if (requestcode == "EA") {
      $("#divRequest").html("");
      $("#divRequest").html(this.EAandEIS);

      $(".page-heading").text("Updating EA and EIS Data");

      $(".loading-modal").addClass("active");
      $("body").addClass("body-hidden");

      $("#Reviewdate").datepicker("setDate", new Date());
      $("#Targetdate").datepicker("setDate", new Date());
      $("#decisiondate").datepicker("setDate", new Date());

      getlistdetails();
    } else if (requestcode == "CE") {
      $("#divRequest").html("");
      $("#divRequest").html(that.CERecords);

      $(".page-heading").text("Updating CE Records");

      $(".loading-modal").addClass("active");
      $("body").addClass("body-hidden");

      getCEoptions();

      $("#CESigndate").datepicker("setDate", new Date());
      $("#prjctenddate").datepicker("setDate", new Date());
    } else if (requestcode == "HT") {
      $("#divRequest").html("");
      $("#divRequest").html(that.Htmlhistory);
      $(".page-heading").text("NEPA Graveyard");

      $(".loading-modal").addClass("active");
      $("body").addClass("body-hidden");

      $("#roddate").datepicker("setDate", new Date());
      $("#txtenddate").datepicker("setDate", new Date());

      fetchHistoryDocuments();
    } else {
      alert("Something went wrong please contact system admin");
    }

    $("#btnSubmit").click(function () {
      $("#btnSubmit").css("pointer-events", "none");

      if (requestcode == "EA") updateEAandEIS();
      else if (requestcode == "CE") updateCERecords();
      else if (requestcode == "HT") updateHistoryDocs();
    });

    $("#btnclose").click(function () {
      window.location.href = siteURL + "/SitePages/RequestDashboard.aspx";
    });

    $(document).on("change", ".custom-file-input", function () {
      if ($(this).val()) {
        var fileValue = $(this).val();
        // returns string containing everything from the end of the string
        //   that is not a back/forward slash or an empty string on error
        //   so one can check if return_value===''
        (typeof fileValue === "string" &&
          (fileValue = fileValue.match(/[^\\\/]+$/)) &&
          fileValue[0]) ||
          "";

        $(this)
          .parent(".custom-file")
          .find(".custom-file-label")
          .text(fileValue[0]);
      } else {
        //alertify.set('notifier', 'position', 'top-right');
        //alertify.error('Please select file');
        $(this).parent().find("label").text("Choose File");
      }
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

async function getlistdetails() {
  await sp.web.lists
    .getByTitle("NepaRequest")
    .fields.filter("EntityPropertyName eq 'EC'")
    .get()
    .then((items: any) => {
      arrEC = items[0].Choices;
    })
    .catch(function (error) {
      ErrorCallBack(error, "getECdetails");
    });

  await sp.web.lists
    .getByTitle("NepaRequest")
    .fields.filter("EntityPropertyName eq 'State'")
    .get()
    .then((items: any) => {
      arrstates = items[0].Choices;
    })
    .catch(function (error) {
      ErrorCallBack(error, "State");
    });

  await sp.web.lists
    .getByTitle("NepaRequest")
    .fields.filter("EntityPropertyName eq 'DecisionMaker'")
    .get()
    .then((items: any) => {
      arrDesMkr = items[0].Choices;
    })
    .catch(function (error) {
      ErrorCallBack(error, "DecisionMaker");
    });

  await sp.web.lists
    .getByTitle("NepaRequest")
    .fields.filter("EntityPropertyName eq 'EAorEIS'")
    .get()
    .then((items: any) => {
      arrEAandEIS = items[0].Choices;
    })
    .catch(function (error) {
      ErrorCallBack(error, "EAorEIS");
    });

  await sp.web.lists
    .getByTitle("NepaRequest")
    .fields.filter("EntityPropertyName eq 'PriorityRank'")
    .get()
    .then((items: any) => {
      arrRanks = items[0].Choices;
    })
    .catch(function (error) {
      ErrorCallBack(error, "PriorityRank");
    });

  await sp.web.lists
    .getByTitle("NepaRequest")
    .fields.filter("EntityPropertyName eq 'TypeofNepa'")
    .get()
    .then((items: any) => {
      arrTypes = items[0].Choices;
    })
    .catch(function (error) {
      ErrorCallBack(error, "TypeofNepa");
    });

  await sp.web.lists
    .getByTitle("NepaRequest")
    .fields.filter("EntityPropertyName eq 'Status'")
    .get()
    .then((items: any) => {
      arrStatus = items[0].Choices;
    })
    .catch(function (error) {
      ErrorCallBack(error, "Status");
    });

  binddropdownvalues(arrEC, "drpEC");
  binddropdownvalues(arrstates, "drpState");
  binddropdownvalues(arrDesMkr, "drpDecMkr");
  binddropdownvalues(arrEAandEIS, "drpEAandEIS");
  binddropdownvalues(arrRanks, "drpPrRank");
  binddropdownvalues(arrTypes, "drptype");
  binddropdownvalues(arrStatus, "drpstatus");

  $("#drpEC,#drpState,#drpDecMkr,#drpEAandEIS").multiselect({
    columns: 1,
    placeholder: "Select",
    search: true,
  });

  $(".loading-modal").removeClass("active");
  $("body").removeClass("body-hidden");
  fetchEAandEIS();
}

async function getCEoptions() {
  await sp.web.lists
    .getByTitle("CERecords")
    .fields.filter("EntityPropertyName eq 'State'")
    .get()
    .then((items: any) => {
      arrStateCE = items[0].Choices;
    })
    .catch(function (error) {
      ErrorCallBack(error, "getCEoptions");
    });

  await sp.web.lists
    .getByTitle("CERecords")
    .fields.filter("EntityPropertyName eq 'Region'")
    .get()
    .then((items: any) => {
      arrRegionCE = items[0].Choices;
    })
    .catch(function (error) {
      ErrorCallBack(error, "getCEoptions");
    });

  binddropdownvalues(arrStateCE, "drpCEState");
  binddropdownvalues(arrRegionCE, "drpCERegion");

  $("#drpCEState,#drpCERegion").multiselect({
    columns: 1,
    placeholder: "Select",
    search: true,
  });

  fetchCERecords();
}

function binddropdownvalues(values, id) {
  var html = "";

  if (id == "drptype" || id == "drpPrRank" || id == "drpstatus")
    html += "<option value=Select>Select</option>";

  for (var i = 0; i < values.length; i++) {
    html += "<option value='" + values[i] + "'>" + values[i] + "</option>";
  }

  $("#" + id + "").html("");
  $("#" + id + "").html(html);
}

async function fetchEAandEIS() {
  await sp.web.lists
    .getByTitle("NepaRequest")
    .items.getById(itemid)
    .get()
    .then((items: any[]) => {
      if (items) {
        $("#DrpNeapRequest").val("EAandEIS");
        setdropdownvalues(items["EC"], "drpEC");
        setdropdownvalues(items["State"], "drpState");
        setdropdownvalues(items["DecisionMaker"], "drpDecMkr");
        setdropdownvalues(items["EAorEIS"], "drpEAandEIS");
        $("#subject").val(items["Subject"]);
        $("#txtsubdetls").val(items["Subjectdetail"]);
        $("#drpPrRank").val(items["PriorityRank"]);
        $("#drptype").val(items["TypeofNepa"]);
        $("#drpstatus").val(items["Status"]);
        $("#lastmr").val(items["LastMR"]);
        $("#species").val(items["Species"]);

        $("#Reviewdate").val(moment(items["ReviewDate"]).format("MM/DD/YYYY"));
        $("#Targetdate").val(
          moment(items["TargetDecisionDate"]).format("MM/DD/YYYY")
        );
        $("#decisiondate").val(
          moment(items["DecisionDate"]).format("MM/DD/YYYY")
        );

        if (items["Feralswine"] == "Yes") $("#chkswine").prop("checked", true);
        else $("#chkswine").prop("checked", false);
      }
    })
    .catch(function (error) {
      ErrorCallBack(error, "fetchEAandEIS");
    });
}

async function fetchCERecords() {
  await sp.web.lists
    .getByTitle("CERecords")
    .items.getById(itemid)
    .get()
    .then((items: any[]) => {
      if (items) {
        $("#DrpNeapRequest").val("CE");
        $("#CESigndate").val(moment(items["CESignDate"]).format("MM/DD/YYYY"));
        $("#prjctenddate").val(
          moment(items["PjctEndDate"]).format("MM/DD/YYYY")
        );
        /*$("#txtregion").val(items["Region"]);
          $("#txtstate").val(items["State"]);*/

        setdropdownvalues(items["Region"], "drpCERegion");
        setdropdownvalues(items["State"], "drpCEState");

        $("#txtFY").val(items["FY"]);
        $("#txtGroup").val(items["Group"]);
      }

      $(".loading-modal").removeClass("active");
      $("body").removeClass("body-hidden");
    })
    .catch(function (error) {
      ErrorCallBack(error, "fetchCERecords");
    });
}

function setdropdownvalues(selectedOptions, id) {
  for (var i in selectedOptions) {
    var optionVal = selectedOptions[i];
    $("#" + id + "")
      .find("option[value='" + optionVal + "']")
      .prop("selected", "selected");
  }
  $("#" + id + "").multiselect("reload");
}

async function fetchHistoryDocuments() {
  $("#DrpNeapRequest").val("Histroy");
  await sp.web.lists
    .getByTitle("HistroyDocuments")
    .items.select("ID,EncodedAbsUrl,Reason,Roddate,Enddate")
    .filter("Id eq " + itemid + "")
    .get()
    .then(function (items) {
      var Name = items[0]["EncodedAbsUrl"].split("/");
      var filename = Name[Name.length - 1];
      var fileurl =
        '<a href="' +
        items[0]["EncodedAbsUrl"] +
        '">' +
        decodeURIComponent(filename) +
        "</a>";
      $("#filelink").html("");
      $("#filelink").html(fileurl);
      $("#roddate").val(moment(items[0]["Roddate"]).format("MM/DD/YYYY"));
      $("#txtenddate").val(moment(items[0]["Enddate"]).format("MM/DD/YYYY"));
      $("#txtreason").val(items[0]["Reason"]);

      $(".loading-modal").removeClass("active");
      $("body").removeClass("body-hidden");
    })
    .catch(function (error) {
      ErrorCallBack(error, "fetchHistoryDocuments");
    });
}

async function updateEAandEIS() {
  $(".loading-modal").addClass("active");
  $("body").addClass("body-hidden");

  var ECSelectedvalues = [];
  var StateSelectedvalues = [];
  var DescMkrSelectedvalues = [];
  var EAandEISselectedvalues = [];

  $("#drpEC option:selected").each(function () {
    ECSelectedvalues.push($(this).val());
  });
  $("#drpState option:selected").each(function () {
    StateSelectedvalues.push($(this).val());
  });
  $("#drpDecMkr option:selected").each(function () {
    DescMkrSelectedvalues.push($(this).val());
  });
  $("#drpEAandEIS option:selected").each(function () {
    EAandEISselectedvalues.push($(this).val());
  });

  var Reviewdate = "";
  var Targetdate = "";
  var decisiondate = "";

  if ($("#Reviewdate").val())
    Reviewdate = moment($("#Reviewdate").val(), "MM/DD/YYYY").format();

  if ($("#Targetdate").val())
    Targetdate = moment($("#Targetdate").val(), "MM/DD/YYYY").format();

  if ($("#decisiondate").val())
    decisiondate = moment($("#decisiondate").val(), "MM/DD/YYYY").format();

  var Feralswine = "No";
  if ($("#chkswine").prop("checked")) Feralswine = "Yes";

  var requestdata = {
    //Title:"asfasfasfas",
    EC: { results: ECSelectedvalues },
    State: { results: StateSelectedvalues },
    DecisionMaker: { results: DescMkrSelectedvalues },
    EAorEIS: { results: EAandEISselectedvalues },
    PriorityRank: $("#drpPrRank option:selected").val(),
    TypeofNepa: $("#drptype option:selected").val(),
    Status: $("#drpstatus option:selected").val(),
    ReviewDate: Reviewdate,
    TargetDecisionDate: Targetdate,
    DecisionDate: decisiondate,
    LastMR: $("#lastmr").val(),
    Feralswine: Feralswine,
    Species: $("#species").val(),
    Subject: $("#subject").val(),
    Subjectdetail: $("#txtsubdetls").val(),
  };

  await sp.web.lists
    .getByTitle("NepaRequest")
    .items.getById(itemid)
    .update(requestdata)
    .then(function (data) {
      $(".loading-modal").removeClass("active");
      $("body").removeClass("body-hidden");

      AlertMessage("Record updated successfully");
    })
    .catch(function (error) {
      ErrorCallBack(error, "insertEAandEIS");
    });
}

async function updateCERecords() {
  $(".loading-modal").addClass("active");
  $("body").addClass("body-hidden");

  var CERegionSelectedvalues = [];
  var CEstateSelectedvalues = [];

  $("#drpCERegion option:selected").each(function () {
    CERegionSelectedvalues.push($(this).val());
  });
  $("#drpCEState option:selected").each(function () {
    CEstateSelectedvalues.push($(this).val());
  });

  var requestdata = {
    /*Region:$("#txtregion").val(),
    State:$("#txtstate").val(),*/
    Region: { results: CERegionSelectedvalues },
    State: { results: CEstateSelectedvalues },
    CESignDate: moment($("#CESigndate").val(), "MM/DD/YYYY").format(),
    PjctEndDate: moment($("#prjctenddate").val(), "MM/DD/YYYY").format(),
    FY: $("#txtFY").val(),
    Group: $("#txtGroup").val(),
  };

  await sp.web.lists
    .getByTitle("CERecords")
    .items.getById(itemid)
    .update(requestdata)
    .then(function (data) {
      $(".loading-modal").removeClass("active");
      $("body").removeClass("body-hidden");

      AlertMessage("Record updated successfully");
    })
    .catch(function (error) {
      ErrorCallBack(error, "CERecords");
    });
}

async function updateHistoryDocs() {
  $(".loading-modal").addClass("active");
  $("body").addClass("body-hidden");

  var hstrydata = {
    Reason: $("#txtreason").val(),
    Roddate: moment($("#roddate").val(), "MM/DD/YYYY").format(),
    Enddate: moment($("#txtenddate").val(), "MM/DD/YYYY").format(),
  };
  sp.web.lists
    .getByTitle("HistroyDocuments")
    .items.getById(itemid)
    .update(hstrydata)
    .then(function (results) {
      $(".loading-modal").removeClass("active");
      $("body").removeClass("body-hidden");

      AlertMessage("Record updated successfully");
    })
    .catch(function (error) {
      ErrorCallBack(error, "files");
    });
}

function getUrlParameter(param) {
  var url = window.location.href
    .slice(window.location.href.indexOf("?") + 1)
    .split("&");
  for (var i = 0; i < url.length; i++) {
    var urlparam = url[i].split("=");
    if (urlparam[0] == param) {
      return urlparam[1];
    }
  }
}

function AlertMessage(strMewssageEN) {
  alertify
    .alert()
    .setting({
      label: "OK",

      message: strMewssageEN,

      onok: function () {
        window.location.href = siteURL + "/SitePages/RequestDashboard.aspx";
      },
    })
    .show()
    .setHeader("<em>Confirmation</em> ")
    .set("closable", false);
}

function ErrorCallBack(error, methodname) {
  $(".loading-modal").removeClass("active");
  $("body").addClass("body-hidden");
  alert(error + "-" + methodname);
}
