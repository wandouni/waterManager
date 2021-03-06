$(function () {
  var xAxis = [];
  var yAxis = [];
  var $start_year = $('.start-year');
  var $end_year = $('.end-year');
  var $year_item = $('.year-item');
  var $year_input = $('.year-input');
  var $pre_year = $('.pre-year');   //三角上一个
  var $next_year = $('.next-year');   //三角下一个
  var $year_title = $('.year-title span');  //年的标题
  var $select_year_wrapper = $('.select-year-wrapper');
  var $year_item_li = $('.year-item li');  //年列表item
  var $confirm_btn = $('.confirm-btn');  //今年
  var $search_btn = $('.search-btn');
  var $search_tip = $('.search-tip');
  var $year_tbody = $('.year-tbody');
  var $line_no_data = $('.line-no-data');
  var $table_no_data = $('.table-no-data');
  var $select_factory_input = $('.select-factory-input');
  var $select_factory_wrapper = $('.select-factory-wrapper');
  // var $year_input = $('.year-input');
  var permission;

  //MOCK.JS
  var mockdata = {
    "amountTotal": 679.01,
    "dataList": [{"userNum": 1, "priceNum": 12.0, "year": "2016", "amountNum": 100.11}, {
      "userNum": 2,
      "priceNum": 112.0,
      "year": "2017",
      "amountNum": 578.9
    }],
    "userTotal": 2,
    "msg": 0,
    "priceTotal": 124.0
  }
  Mock.mock('http://g.cn', mockdata);


  /*---------------初始化页面----------------*/
  sessionStorage.setItem('permission', 2);
  /*初始化页面，区分电信和水务局*/
  initPage();

  function initPage() {
    //1 电信 2 水务局
    permission = getStorage('permission');
    console.log(permission);
    switch (permission) {
      case '1':
        /*初始化页面*/
        $select_factory_wrapper.css('display', 'block');
        initFactoryList();
        break;
      default:
        $select_factory_wrapper.css('display', 'none');
        (function () {
          var data;
          if (permission === '1') {
            data = 'startYear=' + 2016
              + '&endYear=' + 2017
              + '&managerId=' + $select_factory_input.val();
            checkData(data);
          } else {
            data = 'startYear=' + 2016
              + '&endYear=' + 2017;
            checkData(data);
          }
        })();
        break;
    }
    // initYearSelect();
  }

  function initYearSelect() {
    $start_year.click(function () {
      $select_year_wrapper.removeClass('none');
      generateYearlist();
    });
    $end_year.click(function () {
      $select_year_wrapper.removeClass('none');
      generateYearlist();
    });
    /*当点击其他地方的时候弹框消失*/
    $(document).click(function (event) {
      var target = event.target;
      var flag = $.inArray($select_year_wrapper[0], $(target).parents());
      if (target !== $select_year_wrapper[0] && target !== $year_input[0] && flag < 0) {
        $select_year_wrapper.addClass('none');
      }
    });
    /*三角上的点击事件*/
    $pre_year.click(function () {
      generateYearlist(old_first_year - 1);
    });

    /*三角下的点击事件*/
    $next_year.click(function () {
      generateYearlist(old_first_year + 9);
    });

    /*生成默认年的列表，设置默认年的标题*/
    generateYearlist();

    /*更新年的列表*/
    function generateYearlist(last_y) {
      //清空
      $year_item.empty();
      var last_year = last_y || parseInt($year_input.val());
      var first_year = last_year - 4;
      old_first_year = first_year;
      $year_title.text(last_year);
      for (var i = first_year; i < last_year + 1; i++) {
        $('<li>' + i + '</li>').appendTo($year_item);
      }
      bindListclick();
    }

    /*年列表item的点击事件*/
    function bindListclick() {
      var $list = $('.year-item li');
      for (var i = 0; i < $list.length; i++) {
        (function (j) {
          $($list[j]).click(function (e) {
            check_year = $(e.target).text();
            // $year_title.text(check_year);
            $year_input.val(check_year);
            $select_year_wrapper.addClass('none');
          });
        })(i);
      }
    }

    /*今年按钮的点击事件*/
    $confirm_btn.click(function (e) {
      check_year = new Date().getFullYear();
      // $year_title.text(check_year);
      $year_input.val(check_year);
      $select_year_wrapper.addClass('none');
    });
  }


  function initFactoryList() {
    console.log('ajax21');
    $.ajax({
      type: 'POST',
      url: common_url + '/watersys/getAllWatersysInfo.do',
      dataType: 'json',
      context: document.body,
      data: '',
      timeout: 5000,
      success: function (data) {
        if (data.msg === 0) {
          console.log(data);
          renderFactoryList(data.dataList);
          (function () {
            var data;
            if (permission === '1') {
              data = 'startYear=' + 2016
                + '&endYear=' + 2017
                + '&managerId=' + $select_factory_input.val();
              checkData(data);
            } else {
              data = 'startYear=' + 2016
                + '&endYear=' + 2017;
              checkData(data);
            }
          })();
        } else {
          // alert('未查询到任何水务局信息');
          console.log('未查询到任何水务局信息！');
          $.showSuccessPop({
            msg: '未查询到任何水务局信息',
            autoHide: true
          });
        }
      },
      error: function () {
        console.log('ajax error');
        // alert('ajax error');
        $.showSuccessPop({
          msg: '网络错误，请重试！',
          type: 'failure',
          autoHide: true
        });
      }
    });
  }

  /*----------------搜索按钮的点击事件-------------------*/
  $search_btn.click(function () {
    var start_year_value = $start_year.val();
    var end_year_value = $end_year.val();
    if (start_year_value === '' || end_year_value === '') {
      $search_tip.text('年份输入不能为空！');
      $search_tip.css('display', 'inline-block');
    } else {
      $search_tip.css('display', 'none');
      var data;
      if (permission === '1') {
        data = 'startYear=' + (start_year_value || new Date().getFullYear())
          + '&endYear=' + (end_year_value || new Date().getFullYear())
          + '&managerId=' + $select_factory_input.val();
        checkData(data);
      } else {
        data = 'startYear=' + (start_year_value || new Date().getFullYear())
          + '&endYear=' + (end_year_value || new Date().getFullYear());
        checkData(data);
      }
    }
  });

  function checkData(data) {
    console.log(data);
    /*请求数据*/
    $.ajax({
      type: 'POST',
      url: 'http://g.cn',
      // url: common_url + '/watersys/getUserDataByYear.do',
      dataType: 'json',
      context: document.body,
      data: data,
      timeout: 5000,
      success: function (data) {
        if (data.msg === 0) {
          console.log(data);
          xAxis = [];
          yAxis = [];
          var dataList = data.dataList;
          var length = data.dataList.length;
          for (var i = 0; i < length; i++) {
            xAxis.push(parseInt(dataList[i].year));
            yAxis.push(parseInt(dataList[i].amountNum));
          }
          xAxis.push('');
          xAxis.unshift('');
          yAxis.push('');
          yAxis.unshift('');
          console.log(xAxis);
          console.log(yAxis);
          $line_no_data.css('display', 'none');
          $table_no_data.css('display', 'none');
          renderLine();
          renderTable(data, data.dataList);
        } else {
          renderNodata('无数据');
          // alert('您所查询的年份没有数据');
          console.log('未返回任何数据！');
          $.showSuccessPop({
            msg: '您所查询的年份没有数据',
            autoHide: true
          });
        }
      },
      error: function () {
        renderNodata('网络出错');
        console.log('ajax error');
        // alert('网络出错');
        $.showSuccessPop({
          msg: '网络错误，请重试！',
          type: 'failure',
          autoHide: true
        });
      }
    });
  }

  function renderNodata(text) {
    /*显示表格空*/
    $year_tbody.empty();
    $year_tbody.append($('<tr class="table-no-data"> <td>-</td> <td>-</td> <td>-</td> <td>-</td> <td>-</td> </tr>'));

    /*显示无数据*/
    $line_no_data.text(text);
    $line_no_data.css('display', 'block');
  }

  /*渲染表格*/
  function renderTable(data, arr) {
    $year_tbody.empty();
    for (var j = 0; j < arr.length; j++) {
      (function (num) {
        var $tr = $('<tr><td>'
          + (num + 1) + '</td><td>'
          + arr[j].year + '</td><td>'
          + arr[j].userNum + '</td><td>'
          + arr[j].amountNum + '</td><td>'
          + arr[j].priceNum + '</td></tr>');
        $year_tbody.append($tr);
      })(j);
    }
    $year_tbody.append($('<tr><td>总计</td><td></td><td>' + '</td><td>'
      + data.amountTotal + '</td><td>'
      + data.priceTotal + '</td></tr>'
    ));
  }

  /*渲染折线图*/
  function renderLine() {
    var line_chart_wrapper = echarts.init(document.getElementById('year-line-wrapper'));
    var option = {
      backgroundColor: '#fff',
      xAxis: {
        data: xAxis,
        boundaryGap: false,
        axisLine: {
          lineStyle: {
            color: '#dcdcdc',
            width: 2
          }
        },
        axisTick: {
          inside: true,
          alignWithLabel: true
        },
        axisLabel: {
          textStyle: {
            color: '#939393'
          }
        },
        splitLine: {
          show: true,
          lineStyle: {
            color: ['#ededed']
          }
        }
      },
      yAxis: {
        axisLine: {
          show: false
        },
        axisTick: {
          show: false
        },
        axisLabel: {
          textStyle: {
            color: '#939393'
          }
        },
        splitLine: {
          show: true,
          lineStyle: {
            color: ['#ededed'],
            type: 'doted'
          }
        }
      },
      series: [{
        type: 'line',
        data: yAxis,
        itemStyle: {
          normal: {
            color: '#529fff'
          }
        },
        lineStyle: {
          normal: {
            color: '#529fff'
          }
        }
      }],
      tooltip: {
        trigger: 'item',
        formatter: function (params, ticket, callback) {
          console.log(params);
          var res;
          if ((params.name)[0] === '0') {
            res = (params.name)[1] + '年';
          } else {
            res = params.name + '年';
          }
          res += '<br/>' + params.value + '方';
          return res;
        },
        backgroundColor: '#529fff'
      }
    };
    line_chart_wrapper.setOption(option);
  }

  function getStorage(key) {
    var value = sessionStorage.getItem(key);
    return value ? value : false;
  }

  /*渲染厂商列表*/
  function renderFactoryList(factoryList) {
    for (var i = 0; i < factoryList.length; i++) {
      $select_factory_input.append($('<option>', {
        value: factoryList[i].managerId,
        text: factoryList[i].managerName
      }));
    }
    console.log($select_factory_input.val());
  }
});