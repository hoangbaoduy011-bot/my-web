// Hàm hiển thị thông báo
function showMessage() {
    // Game đã bị gỡ — hiển thị thông báo ngắn
    console.log('Nút đã được nhấn - game không còn sẵn dùng');
    alert('Game đã được gỡ.');
}

// Hàm xử lý form submit
function handleSubmit(event) {
    event.preventDefault();
    alert('Cảm ơn bạn đã gửi tin nhắn!');
    event.target.reset();
}

// Smooth scroll cho navbar links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Log khi trang load và xử lý dropdown
document.addEventListener('DOMContentLoaded', function() {
    console.log('Web đã load thành công!');

    const dropbtn = document.querySelector('.dropbtn');
    if (dropbtn) {
        // Sử dụng event delegation trên body để xử lý click cho tất cả dropdown
        document.body.addEventListener('click', function(event) {
            if (event.target.matches('.dropbtn')) {
                event.preventDefault();
                event.stopPropagation();
                const dropdownContent = event.target.closest('.dropdown').querySelector('.dropdown-content');
                
                // Đóng tất cả các dropdown khác trước khi mở cái mới
                document.querySelectorAll('.dropdown-content.show').forEach(openDropdown => {
                    if (openDropdown !== dropdownContent) {
                        openDropdown.classList.remove('show');
                    }
                });

                if (dropdownContent) {
                    dropdownContent.classList.toggle('show');
                }
            } else {
                // Nếu click ra ngoài, đóng tất cả dropdown
                document.querySelectorAll('.dropdown-content.show').forEach(openDropdown => {
                    openDropdown.classList.remove('show');
                });
            }
        });
    }

    // Tự phát video nếu có
    const video = document.querySelector('.video-player');
    tryAutoplay(video);

    // Khi quay lại tab (visibility change) thử phát lại
    document.addEventListener('visibilitychange', function() {
        if (!document.hidden) {
            const videoPlayer = document.querySelector('.video-player');
            tryAutoplay(videoPlayer);
        }
    });
});

// Hàm tự phát video
function tryAutoplay(video) {
    if (!video) return;
    video.muted = true;
    video.playsInline = true;
    const playPromise = video.play();
    if (playPromise && typeof playPromise.then === 'function') {
        playPromise.catch(() => {
            const onFirstInteract = () => {
                video.muted = true;
                video.play().catch(() => {});
                window.removeEventListener('click', onFirstInteract);
                window.removeEventListener('touchstart', onFirstInteract);
            };
            window.addEventListener('click', onFirstInteract, { once: true });
            window.addEventListener('touchstart', onFirstInteract, { once: true });
        });
    }
}

// Dropdown functionality
document.addEventListener('DOMContentLoaded', function() {
    const dropdownBtn = document.querySelector('.dropbtn');
    const dropdownContent = document.querySelector('.dropdown-content');

    if (dropdownBtn && dropdownContent) {
        dropdownBtn.addEventListener('click', function(event) {
            event.stopPropagation(); // Prevent document click from closing it immediately
            dropdownContent.classList.toggle('show');
        });

        // Close the dropdown if the user clicks outside of it
        window.addEventListener('click', function(event) {
            if (!event.target.matches('.dropbtn')) {
                if (dropdownContent.classList.contains('show')) {
                    dropdownContent.classList.remove('show');
                }
            }
        });
    }
});