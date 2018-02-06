'use strict';

require('./index.css');
require('page/common/header/index.js');
var nav = require('page/common/nav/index.js');
var _mm = require('util/mm.js');
var _order = require('service/order-service.js');
var _address = require('service/address-service.js');
var templateAddress = require('./address-list.string');
var templateProduct = require('./product-list.string');
var addressModal = require('./address-modal.js');

var page = {
    data: {
        selectedAddressId: null
    },
    init: function () {
        this.onLoad();
        this.bindEvent();
    },
    onLoad: function () {
        this.loadAddressList();
        this.loadProductList();
    },
    bindEvent: function () {
        var _this = this;
        // 地址的选择
        $(document).on('click', '.address-item', function () {
            $(this).addClass('active').siblings('.address-item').removeClass('active');
            _this.data.selectedAddressId = $(this).data('id');
        });
        // 订单提交
        $(document).on('click', '.order-submit', function () {
            var shippingId = _this.data.selectedAddressId;
            if (shippingId) {
                _order.createOrder({
                    shippingId: shippingId
                }, function (res) {
                    window.location.href = './payment.html?orderNumber=' + res.orderNo;
                }, function (errMsg) {
                    _mm.errorTips(errMsg);
                });
            } else {
                _mm.errorTips('请选择地址后在提交');
            }
        });
        // 地址的添加
        $(document).on('click', '.address-add', function () {
            addressModal.show({
                isUpdate: false,
                onSuccess: function () {
                    _this.loadAddressList();
                }
            });
        });
        // 地址的编辑
        $(document).on('click', '.address-update', function (e) {
            e.stopPropagation();
            var shippingId = $(this).parents('.address-item').data('id');
            _address.getAddress(shippingId, function (res) {
                addressModal.show({
                    isUpdate: true,
                    data: res,
                    onSuccess: function () {
                        _this.loadAddressList();
                    }
                });
            }, function (errMsg) {

            });
        });
        // 地址的删除
        $(document).on('click', '.address-delete', function (e) {
            e.stopPropagation();
            var id = $(this).parents('.address-item').data('id');
            if (window.confirm('确认要删除改地址吗？')) {
                _address.dateleAddress(id, function (res) {
                    _this.loadAddressList();
                }, function (errMsg) {
                    _mm.errorTips(errMsg);
                });
            }
        });
    },
    // 加载地址列表
    loadAddressList: function () {
        var _this = this;
        $('.address-con').html('<div class="loading"></div>');
        // 获取地址列表
        _address.getAddressList(function (res) {
            _this.addressFilter(res);
            var addressListHtml = _mm.renderHtml(templateAddress, res);
            $('.address-con').html(addressListHtml);
        }, function () {
            $('.address-con').html('<p class="err-tip">地址加载失败，请刷新后重试</p>');
        });

    },
    // 处理地址列表中选中状态
    addressFilter: function (data) {
        if (this.data.selectedAddressId) {
            var selectedAddressIdFlag = false;
            for (var i = 0, length = data.list.length; i < length; i++) {
                if(data.list[i].id === this.data.selectedAddressId){
                    data.list[i].isActive = true;
                    selectedAddressIdFlag = true;
                }
            }
            // 如果以前选中的地址不在列表里，将其删除
            if (!selectedAddressIdFlag) {
                this.data.selectedAddressId = null;
            }
        }
    },
    loadProductList: function () {
        $('.product-con').html('<div class="loading"></div>');
        // 加载商品清单
        _order.getProductList(function (res) {
            var productListHtml = _mm.renderHtml(templateProduct, res);
            $('.product-con').html(productListHtml);
        }, function () {
            $('.product-con').html('<p class="err-tip">商品信息加载失败，请刷新后重试</p>');
        });
    }
};
$(function () {
    page.init();
});