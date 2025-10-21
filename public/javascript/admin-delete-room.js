// public/javascript/admin-delete-room.js

let currentRoomId = null;
let currentRoomName = null;

function openDeleteModal(roomId, roomName) {
    currentRoomId = roomId;
    currentRoomName = roomName;
    
    // Set room name in modal
    document.getElementById('modalRoomName').textContent = roomName;
    
    // Set form action
    document.getElementById('deleteForm').action = `/admin/rooms/${roomId}/delete`;
    
    // Show modal
    document.getElementById('modalOverlay').classList.add('active');
    document.getElementById('deleteModal').classList.add('active');
    
    // Prevent body scroll
    document.body.style.overflow = 'hidden';
}

function closeDeleteModal() {
    // Confirm before closing if user has typed something
    const reasonInput = document.querySelector('.modal-reason-input');
    if (reasonInput.value.trim() !== '') {
        if (!confirm('Bạn có chắc chắn muốn thoát? Dữ liệu bạn nhập sẽ bị mất.')) {
            return;
        }
    }
    
    // Hide modal
    document.getElementById('modalOverlay').classList.remove('active');
    document.getElementById('deleteModal').classList.remove('active');
    
    // Reset form
    document.getElementById('deleteForm').reset();
    
    // Enable body scroll
    document.body.style.overflow = 'auto';
    
    currentRoomId = null;
    currentRoomName = null;
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    // Handle form submission
    const deleteForm = document.getElementById('deleteForm');
    if (deleteForm) {
        deleteForm.addEventListener('submit', function(e) {
            const reasonInput = this.querySelector('textarea[name="reason"]');
            if (reasonInput.value.trim() === '') {
                e.preventDefault();
                alert('Vui lòng nhập lý do xóa bài đăng!');
                reasonInput.focus();
                return false;
            }
            
            // Show loading state
            const submitBtn = this.querySelector('.modal-btn-confirm');
            submitBtn.disabled = true;
            submitBtn.textContent = 'Đang xóa...';
        });
    }

    // Close modal on ESC key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            const modal = document.getElementById('deleteModal');
            if (modal && modal.classList.contains('active')) {
                closeDeleteModal();
            }
        }
    });
});