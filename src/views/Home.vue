<template>
  <div class="home">
    <ul :class="asideClose ? 'menu_list menu_list_close':'menu_list menu_list_Open'" @mouseenter="handleMouseenter" @mouseleave="handleMouseleave">
      <!--<li :class="belong === '1' ?'active_menu': ''" @click="menuSelect('1')"><span class="huo_dong"></span>{{asideClose?' ':'社团'}}</li>-->
      <li :class="belong === '2' ?'active_menu': ''" @click="menuSelect('2')"><span class="she_tuan"></span>{{asideClose?' ':'活动'}}</li>
      <li :class="belong === '3' ?'active_menu': ''" @click="menuSelect('3')"><span class="xiao_xi"></span>{{asideClose?' ':'消息'}}</li>
    </ul>
    <div :class="asideClose ? 'search_box search_box_hide':'search_box'">
      <SearchView :belong="belong"/>
      <div :class="asideClose ? 'aside_control aside_open':'aside_control aside_close'" @click="asideControl" ref="aside_control"></div>
    </div>
    <div class="map_box">
      <MapView :belong="belong"/>
    </div>
  </div>
</template>

<script>
import SearchView from '../components/SearchView'
import MapView from '../components/MapView'
export default {
  name: 'home',
  components: {
    SearchView,
    MapView
  },
  data () {
    return {
      belong: '1', // 页面展示 1。活动信息，2。社团信息
      asideClose: false
    }
  },
  methods: {
    // 页面展示切换
    menuSelect (val) {
      this.belong = val
    },
    handleMouseenter () {
      this.$refs.aside_control.style.display = 'block'
    },
    handleMouseleave () {
      this.$refs.aside_control.style.display = 'none'
    },
    // 菜单控制
    asideControl () {
      this.asideClose = !this.asideClose
    }
  },
  created () {
    EOA.callNative({
      method: 'setRefreshVisibility',
      params: {
        "visibility": "visible" // visible:显示 gone:隐藏
      }
    });
  },
  mounted () {
    //防止按backspace键页面后退
    history.pushState(null, null, document.URL);
    window.addEventListener('popstate', function () {
      history.pushState(null, null, document.URL);
    });
  }
}
</script>

<style lang="less" scoped>
.home{
  width: 100%;
  height: 100%;
  display: flex;
  .menu_list{
    width: 232px;
    height: 100%;
    border-right: 1px solid #E6E6E6;
    padding: 20px 16px;
    position: relative;
    li{
      line-height: 56px;
      height: 56px;
      margin-bottom: 20px;
      padding-left: 50px;
      position: relative;
      cursor: pointer;
      overflow: hidden;
      white-space: nowrap
    }
  }
  .menu_list_close{
    width: 88px;
    transition: .2s
  }
  .menu_list_Open{
    width: 232px;
    transition: .2s
  }
  .search_box{
    width: 360px;
    height: 100%;
    background: #fff;
    position: relative;
    &:hover .aside_control{
      display: block!important;
    }
  }
  .search_box_hide{
    width: 0;
    transition: .2s
  }
  .search_box_open{
    width: 360px;
    transition: .2s
  }
  .map_box{
    flex: 1;
    height: 100%;
    position: relative;
  }
}
.aside_control{
  display: none;
  position: absolute!important;
  right: -15px;
  top: 0;
  width: 15px;
  height: 100%;
  z-index: 99;
  cursor: pointer;
}
.aside_open{
  background: url("../assets/img/ic_zhankai.png") no-repeat left center;
}
.aside_close{
  background: url("../assets/img/ic_shouqi.png") no-repeat left center;
}
.active_menu{
  background: #fff;
}
.huo_dong{
  display: inline-block;
  width: 36px;
  height: 36px;
  position: absolute;
  left: 0;
  margin: 10px;
  background: url("../assets/img/menu_jigou.png") no-repeat center;
}
.she_tuan{
  display: inline-block;
  width: 36px;
  height: 36px;
  position: absolute;
  left: -1px;
  margin: 10px;
  background: url("../assets/img/menu_jigou.png") no-repeat center;
}
.xiao_xi{
  display: inline-block;
  width: 36px;
  height: 36px;
  position: absolute;
  left: -1px;
  margin: 10px;
  background: url("../assets/img/menu_qiye.png") no-repeat center;
}
</style>
