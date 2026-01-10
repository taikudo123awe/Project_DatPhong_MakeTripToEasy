// public/javascript/dateRangePicker.js
$(function () {
  const $dateRange = $('#dateRange');
  const $checkIn = $('#checkInDate');
  const $checkOut = $('#checkOutDate');

  if ($dateRange.length) {
    $dateRange.daterangepicker(
      {
        autoApply: true,
        locale: {
          format: 'YYYY-MM-DD',
          separator: ' đến ',
          applyLabel: 'Chọn',
          cancelLabel: 'Hủy',
          daysOfWeek: ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'],
          monthNames: [
            'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6',
            'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'
          ],
          firstDay: 1
        },
        minDate: moment().format('YYYY-MM-DD'), // Không cho chọn ngày quá khứ
      },
      function (start, end) {
        // Gán giá trị vào 2 input hidden
        $checkIn.val(start.format('YYYY-MM-DD'));
        $checkOut.val(end.format('YYYY-MM-DD'));
      }
    );
  }
});
$(function () {
  // ---- LẤY GIÁ PHÒNG TRUYỀN TỪ EJS VÀO QUA data-attribute ----
  const pricePerNight = Number($('#dateRange').data('price')) || 0;

  // Cấu hình daterangepicker
  $('#dateRange').daterangepicker({
    locale: {
      format: 'YYYY-MM-DD',
      applyLabel: 'Áp dụng',
      cancelLabel: 'Hủy',
      fromLabel: 'Từ',
      toLabel: 'Đến',
      customRangeLabel: 'Tùy chọn',
      weekLabel: 'Tuần',
      daysOfWeek: ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'],
      monthNames: [
        'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6',
        'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'
      ],
    },
    autoUpdateInput: false,
    minDate: moment().startOf('day')
  });

  // Khi người dùng chọn ngày
  $('#dateRange').on('apply.daterangepicker', function (ev, picker) {
    const checkIn = picker.startDate.format('YYYY-MM-DD');
    const checkOut = picker.endDate.format('YYYY-MM-DD');
    const nights = Math.max(1, picker.endDate.diff(picker.startDate, 'days'));

    // Gán giá trị vào input ẩn (để submit form)
    $('#checkInDate').val(checkIn);
    $('#checkOutDate').val(checkOut);

    // Hiển thị lại vào ô nhập
    $(this).val(`${checkIn} đến ${checkOut}`);

    // Cập nhật số đêm hiển thị
    $('#nightCount').text(nights);

    // Tính tổng giá
    const total = pricePerNight * nights;
    const formatted = total.toLocaleString('vi-VN', {
      style: 'currency',
      currency: 'VND'
    });

    // Cập nhật tổng giá hiển thị
    $('#totalPrice').text(formatted);
  });
});
