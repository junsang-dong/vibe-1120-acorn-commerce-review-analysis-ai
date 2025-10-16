let sentimentChart = null;
let currentProductId = null;
let currentReviews = [];

document.getElementById('getInfoBtn').addEventListener('click', getProductInfo);
document.getElementById('analyzeReviewsBtn').addEventListener('click', analyzeReviews);
document.getElementById('exportCsvBtn').addEventListener('click', exportToCsv);

document.getElementById('productInput').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        getProductInfo();
    }
});

async function getProductInfo() {
    const productInput = document.getElementById('productInput').value.trim();
    
    if (!productInput) {
        showError('상품 URL을 입력해주세요.');
        return;
    }

    // UI 상태 변경
    showLoading('상품 정보를 조회하는 중입니다...');
    hideError();
    hideProductInfo();
    hideResults();
    disableButton('getInfoBtn');

    try {
        const response = await fetch('/get-product-info', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                product_input: productInput
            })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || '상품 정보 조회 중 오류가 발생했습니다.');
        }

        // 상품 정보 표시
        displayProductInfo(data);
        currentProductId = data.product_id;
        
    } catch (error) {
        showError(error.message);
    } finally {
        hideLoading();
        enableButton('getInfoBtn');
    }
}

async function analyzeReviews() {
    if (!currentProductId) {
        showError('상품 정보를 먼저 조회해주세요.');
        return;
    }

    // UI 상태 변경
    showLoading('리뷰를 수집하고 분석하는 중입니다... (최대 1분 소요)');
    hideError();
    hideResults();
    hideReviewsDisplay();
    disableButton('analyzeReviewsBtn');

    try {
        const response = await fetch('/analyze-reviews', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                product_id: currentProductId
            })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || '리뷰 분석 중 오류가 발생했습니다.');
        }

        // 결과 표시
        currentReviews = data.reviews;
        displayResults(data);
        displayReviewsTable(data.reviews);
        
    } catch (error) {
        showError(error.message);
    } finally {
        hideLoading();
        enableButton('analyzeReviewsBtn');
    }
}

function displayProductInfo(data) {
    const info = data.product_info;
    
    // 상품 정보 표시
    document.getElementById('productName').textContent = info.product_name || '정보 없음';
    document.getElementById('totalReviews').textContent = info.total_reviews ? info.total_reviews.toLocaleString() + '개' : '정보 없음';
    document.getElementById('avgRating').textContent = info.avg_rating ? info.avg_rating + '점' : '정보 없음';
    document.getElementById('positiveRatio').textContent = info.positive_ratio ? info.positive_ratio + '%' : '정보 없음';
    document.getElementById('negativeRatio').textContent = info.negative_ratio ? info.negative_ratio + '%' : '정보 없음';
    
    // 경쟁 제품 표시
    const similarProductsContainer = document.getElementById('similarProducts');
    similarProductsContainer.innerHTML = '';
    
    if (info.similar_products && info.similar_products.length > 0) {
        info.similar_products.forEach(product => {
            const productItem = document.createElement('div');
            productItem.className = 'similar-product-item';
            productItem.innerHTML = `
                <a href="https://www.amazon.com/dp/${product.asin}" target="_blank">
                    ${product.title}
                </a>
            `;
            similarProductsContainer.appendChild(productItem);
        });
    } else {
        similarProductsContainer.innerHTML = '<p>경쟁 제품 정보를 찾을 수 없습니다.</p>';
    }
    
    // 상품 정보 섹션 보이기
    document.getElementById('productInfoSection').style.display = 'block';
    
    // 상품 정보로 스크롤
    document.getElementById('productInfoSection').scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
    });
}

function displayResults(data) {
    // 통계 표시
    document.getElementById('positiveCount').textContent = data.sentiment_stats.positive;
    document.getElementById('neutralCount').textContent = data.sentiment_stats.neutral;
    document.getElementById('negativeCount').textContent = data.sentiment_stats.negative;

    // 요약 리포트 표시
    document.getElementById('summaryContent').textContent = data.summary;

    // 차트 표시
    displayChart(data.sentiment_stats);

    // 리뷰 표시 섹션 보이기
    document.getElementById('reviewsDisplaySection').style.display = 'block';

    // 결과 섹션 보이기
    document.getElementById('resultsSection').style.display = 'block';

    // 결과로 스크롤
    document.getElementById('resultsSection').scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
    });
}

function displayChart(stats) {
    const ctx = document.getElementById('sentimentChart').getContext('2d');
    
    // 기존 차트가 있으면 제거
    if (sentimentChart) {
        sentimentChart.destroy();
    }

    sentimentChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['긍정 😊', '중립 😐', '부정 😞'],
            datasets: [{
                data: [stats.positive, stats.neutral, stats.negative],
                backgroundColor: [
                    'rgba(76, 175, 80, 0.8)',
                    'rgba(255, 152, 0, 0.8)',
                    'rgba(244, 67, 54, 0.8)'
                ],
                borderColor: [
                    'rgba(76, 175, 80, 1)',
                    'rgba(255, 152, 0, 1)',
                    'rgba(244, 67, 54, 1)'
                ],
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        font: {
                            size: 14
                        },
                        padding: 20
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const label = context.label || '';
                            const value = context.parsed || 0;
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = ((value / total) * 100).toFixed(1);
                            return `${label}: ${value}개 (${percentage}%)`;
                        }
                    }
                }
            }
        }
    });
}

function displayReviewsTable(reviews) {
    const tableBody = document.getElementById('reviewsTableBody');
    tableBody.innerHTML = '';

    reviews.forEach((review, index) => {
        const row = document.createElement('tr');
        
        const stars = '⭐'.repeat(Math.floor(review.rating));
        
        const sentimentText = {
            'positive': '긍정',
            'negative': '부정',
            'neutral': '중립'
        };

        row.innerHTML = `
            <td>${index + 1}</td>
            <td>
                <div class="rating-stars">${stars}</div>
                <div style="font-size: 0.8rem; color: #666;">${review.rating}점</div>
            </td>
            <td>
                <span class="sentiment-badge ${review.sentiment}">
                    ${sentimentText[review.sentiment]}
                </span>
            </td>
            <td>
                <div class="review-text">${review.text}</div>
            </td>
        `;

        tableBody.appendChild(row);
    });
}

async function exportToCsv() {
    if (!currentReviews || currentReviews.length === 0) {
        showError('내보낼 리뷰 데이터가 없습니다.');
        return;
    }

    try {
        const response = await fetch('/export-csv', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                reviews: currentReviews
            })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'CSV 내보내기 중 오류가 발생했습니다.');
        }

        // CSV 파일 다운로드
        downloadCsv(data.csv_data, data.filename);
        
    } catch (error) {
        showError(error.message);
    }
}

function downloadCsv(csvContent, filename) {
    // BOM 추가 (한글 깨짐 방지)
    const BOM = '\uFEFF';
    const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
    
    // 다운로드 링크 생성
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // URL 해제
    URL.revokeObjectURL(url);
}

function showLoading(text = '로딩 중...') {
    document.getElementById('loadingText').textContent = text;
    document.getElementById('loadingSection').style.display = 'block';
}

function hideLoading() {
    document.getElementById('loadingSection').style.display = 'none';
}

function hideProductInfo() {
    document.getElementById('productInfoSection').style.display = 'none';
}

function hideReviewsDisplay() {
    document.getElementById('reviewsDisplaySection').style.display = 'none';
}

function showError(message) {
    document.getElementById('errorSection').style.display = 'block';
    document.getElementById('errorMessage').textContent = message;
}

function hideError() {
    document.getElementById('errorSection').style.display = 'none';
}

function hideResults() {
    document.getElementById('resultsSection').style.display = 'none';
}

function disableButton(buttonId) {
    const btn = document.getElementById(buttonId);
    btn.disabled = true;
    btn.querySelector('.btn-text').style.display = 'none';
    btn.querySelector('.btn-loading').style.display = 'inline-block';
}

function enableButton(buttonId) {
    const btn = document.getElementById(buttonId);
    btn.disabled = false;
    btn.querySelector('.btn-text').style.display = 'inline-block';
    btn.querySelector('.btn-loading').style.display = 'none';
}

