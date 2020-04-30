<template>
  <!--  地图展示-->
  <div class="map_view">
    <div id="container" class="map_box"></div>
  </div>
</template>

<script>
  // import Zuobiao from '@/assets/img/ic_zuobiao.png'
  import zuobiao_active from '@/assets/img/ic_zuobiao.png'
  import Zuobiao from '@/assets/img/zuobiao_active.png'
  import {getGeo} from '@/utils/index'

  window.setMapMark = {}
  let map
  let listener
  let activeMark
  export default {
    name: 'MapView',
    props: ['belong'],
    data() {
      return {
        geoUrl: '',
        geoKey: '',
        markSetFinish: true, // 所有标记点是否设置完毕，菜单快速切换时，一菜单的标注点为设置完毕，就切换到二菜单，这些点会标到二菜单上
      }
    },
    methods: {
      mapInit() {
        const _this = this
        map = new AMap.Map('container', {
          zooms: [3, 17],
          resizeEnable: true
        })
        map.setZoomAndCenter(10, [116.397228, 39.909604]);
        AMap.plugin([
          'AMap.ToolBar'
        ], function () {
          // 在图面添加工具条控件，工具条控件集成了缩放、平移、定位等功能按钮在内的组合控件
          map.addControl(new AMap.ToolBar({
            // 简易缩放模式，默认为 false
            liteStyle: true
          }))
        })
        // 监听地图容器大小改变事件
        map.on('resize', function () {
          map.setFitView()
        })
      },
      // 设置标记点
      setMarks(lngLatData, belong) {
        if (listener) {
          AMap.event.removeListener(listener)
        }
        if (belong === this.belong) {
          if (lngLatData.length > 0) {
            map.setZoomAndCenter(10, [113.625368, 34.746599]);
          }
          map.clearMap()
          if (activeMark) {
            map.remove(activeMark)
          }
          lngLatData.forEach(item => {
            if (item.lng && item.lat) {
              this.markByLngLat([item.lng, item.lat], item.id)
            }
          })
          map.setFitView()
        }
      },
      // 根据经纬度标记点
      markByLngLat(lnglat, id) {
        const _this = this
        let marker = new AMap.Marker({
          position: lnglat,
          icon: Zuobiao
        })
        map.add(marker)
        AMap.event.addListener(marker, 'click', function () {
          if (id) {
            if (activeMark) {
              map.remove(activeMark)
            }
            // debugger
            activeMark = new AMap.Marker({
              position: lnglat,
              icon: zuobiao_active,
            })
            map.add(activeMark)
            AMap.event.addListener(activeMark, 'click', function () {
              _this.queryDetail(activeMark, id)
            })
            _this.queryDetail(marker, id)
          }
        });
      },
      // 获取改点详情信息
      queryDetail(marker, id, item) {
        this.axios({
          method: 'get',
          url: '/pc/activity/detail',
          params: {
            id: id,
            belong: this.belong
          }
        }).then(({data}) => {
          const windowTitle = this.belong === '1' ? '社团' : '活动'
          let content = '<div class="map_info_wrap"><div class="map_info_title "><span>' + windowTitle + '详情</span></div>'
          content += '<div class="map_info_content">'
          if (data.propertyList && data.propertyList.length > 0) {
            data.propertyList.forEach(item => {
              if (item.value) {
                let val = item.value
                if (item.code === 'A000002' || item.code === 'A000005') {
                  val = data.sourceInfo.name
                }
                content += '<div class="map_info_content_item"><div class="label">' + item.name + '</div><div class="content">' + val + '</div></div>'
              }
            })
          } else {
            content += '<div class="map_info_empty">暂无' + windowTitle + '信息</div>'
          }
          content += '</div></div>'
          const infoWindow = new AMap.InfoWindow({
            content: content,
            offset: new AMap.Pixel(200, 280)
          });
          if (item) {
            infoWindow.open(map, [item.lng, item.lat]);
            if (activeMark) {
              map.remove(activeMark)
            }
            activeMark = new AMap.Marker({
              position: [item.lng, item.lat],
              icon: zuobiao_active,
              iconStyle: 'black',
            })
            map.add(activeMark)
          } else {
            infoWindow.open(map, marker.getPosition());
            window.setActive.setActiveId(data.id, data.name)
          }
        }).catch(() => {
          const windowTitle = this.belong === '1' ? '社团' : '活动'
          let content = '<div class="map_info_wrap"><div class="map_info_title "><span>' + windowTitle + '详情</span></div>'
          content += '<div class="map_info_content">'
          content += '<div class="map_info_error">' + windowTitle + '信息加载失败</div>'
          content += '</div></div>'
          const infoWindow = new AMap.InfoWindow({
            content: content,
            offset: new AMap.Pixel(200, 280)
          });
          if (item) {
            infoWindow.open(map, [item.lng, item.lat]);
          } else {
            infoWindow.open(map, marker.getPosition());
          }
        })
      },
      // 根据输入地址标记点
      markByAddress(address, callback) {
        map.clearMap()
        const _this = this
        getGeo(_this.geoUrl + '?address=' + address + '&key=' + _this.geoKey, (result) => {
          if (result.status === '1' && result.geocodes.length && result.geocodes.length > 0) {
            let lnglat = result.geocodes[0].location.split(',')
            _this.lngLat = lnglat
            _this.markByLngLat(lnglat)
            callback(lnglat)
            map.setFitView()
            listener = AMap.event.addListener(map, 'click', function (e) {
              lnglat = [e.lnglat.lng, e.lnglat.lat]
              callback(lnglat)
              _this.lngLat = lnglat
              map.clearMap()
              let marker = new AMap.Marker({
                icon: Zuobiao,
                position: lnglat
              })
              map.add(marker)
            })
            _this.currentAddress = _this.address
          } else {
            _this.lngLat = {}
            _this.currentAddress = ''
            _this.$toast('地址查询失败')
          }
        })
      },
      // 获取高德地图的url和key
      queryGeoUrl() {
        this.axios({
          method: 'get',
          url: '/pc/queryGeoUrl'
        }).then(({data}) => {
          this.geoUrl = data.url
          this.geoKey = data.key
        })
      }
    },
    mounted() {
      window.setMapMark = this
      this.mapInit()
    }
  }
</script>

<style lang="less" scoped>
  .map_view {
    width: 100%;
    height: 100%;

    .map_box {
      width: 100%;
      height: 100%
    }
  }

  /deep/ .amap-info-content {
    padding: 0;

    .amap-info-close {
      top: 22px;
      right: 20px;
      color: #666;
    }
  }

  /deep/ .amap-info-sharp {
    display: none;
  }

  /deep/ .map_info_wrap {
    width: 320px;

    .map_info_title {
      line-height: 60px;
      background: #F1F2F3;
      padding-left: 20px;
    }

    .map_info_content {
      max-height: 340px;
      min-height: 240px;
      overflow-y: auto;
      padding-top: 20px;

      .map_info_content_item {
        display: flex;
        margin-bottom: 16px;

        .label {
          width: 90px;
          padding-right: 10px;
          text-align: right;
          color: #666666;
          word-break: break-all;
        }

        .content {
          flex: 1;
          padding-right: 16px;
          word-break: break-all;
        }
      }

      .map_info_error, .map_info_empty {
        width: 100%;
        height: 200px;
        font-size: 12px;
        color: #BBBBBB;
        text-align: center;
        padding-top: 135px;
      }

      .map_info_error {
        background: url(../assets/img/load_error.png) no-repeat center 40px;
      }

      .map_info_empty {
        background: url(../assets/img/no_history.png) no-repeat center 40px;
      }
    }
  }

  /deep/ .amap-indoormap-floorbar-control {
    display: none !important;
  }
</style>
