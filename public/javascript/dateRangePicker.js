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
