// 存储游戏数据的键名
const GAMES_STORAGE_KEY = 'games';

// DOM 元素
const addGameBtn = document.getElementById('addGameBtn');
const addGameModal = document.getElementById('addGameModal');
const addGameForm = document.getElementById('addGameForm');
const gameGrid = document.querySelector('.game-grid');
const yearFilter = document.getElementById('yearFilter');
const platformFilter = document.getElementById('platformFilter');

// 获取存储的游戏数据
function getGames() {
    const games = localStorage.getItem(GAMES_STORAGE_KEY);
    return games ? JSON.parse(games) : [];
}

// 保存游戏数据
function saveGames(games) {
    localStorage.setItem(GAMES_STORAGE_KEY, JSON.stringify(games));
}

// 显示添加游戏的模态框
addGameBtn.addEventListener('click', () => {
    addGameModal.classList.add('active');
});

// 关闭模态框
addGameModal.querySelector('.cancel-btn').addEventListener('click', () => {
    addGameModal.classList.remove('active');
    addGameForm.reset();
});

// 添加新游戏
addGameForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const coverFile = document.getElementById('gameCover').files[0];
    if (!coverFile) {
        alert('请选择游戏封面图片');
        return;
    }
    
    // 将图片转换为Base64
    const reader = new FileReader();
    const coverBase64 = await new Promise((resolve) => {
        reader.onload = (e) => resolve(e.target.result);
        reader.readAsDataURL(coverFile);
    });
    
    const newGame = {
        id: Date.now(),
        title: document.getElementById('gameTitle').value,
        cover: coverBase64,
        playDate: document.getElementById('playDate').value,
        releaseDate: document.getElementById('releaseDate').value,
        platform: document.getElementById('platform').value,
        rating: document.getElementById('rating').value,
        review: document.getElementById('review').value
    };
    
    const games = getGames();
    games.push(newGame);
    saveGames(games);
    
    addGameModal.classList.remove('active');
    addGameForm.reset();
    updateGameList();
    updateFilters();
});

// 删除游戏
function deleteGame(gameId, event) {
    event.stopPropagation();
    if (confirm('确定要删除这个游戏记录吗？')) {
        const games = getGames();
        const updatedGames = games.filter(game => game.id !== gameId);
        saveGames(updatedGames);
        updateGameList();
        updateFilters();
    }
}

// 创建游戏卡片
function createGameCard(game) {
    const card = document.createElement('div');
    card.className = 'game-card';
    card.innerHTML = `
        <button class="delete-btn" title="删除游戏">×</button>
        <img src="${game.cover}" alt="${game.title}" class="game-cover">
        <div class="game-info">
            <h3 class="game-title">${game.title}</h3>
            <div class="game-details">
                <p>发售日期：${new Date(game.releaseDate).toLocaleDateString()}</p>
                <p>游玩平台：${game.platform}</p>
                <p>游玩日期：${new Date(game.playDate).toLocaleDateString()}</p>
            </div>
            <div class="game-rating">评分：${game.rating}/10</div>
        </div>
    `;
    
    // 添加删除按钮事件
    card.querySelector('.delete-btn').addEventListener('click', (e) => deleteGame(game.id, e));
    
    // 点击卡片显示游戏详情
    card.addEventListener('click', () => showGameDetails(game));
    
    return card;
}

// 显示游戏详情
function showGameDetails(game) {
    const modal = document.getElementById('gameDetailsModal');
    const closeBtn = modal.querySelector('.close-btn');
    const editBtn = modal.querySelector('.edit-btn');
    
    // 填充详情内容
    document.getElementById('detailsCover').src = game.cover;
    document.getElementById('detailsTitle').textContent = game.title;
    document.getElementById('detailsInfo').innerHTML = `
        <p>发售日期：${new Date(game.releaseDate).toLocaleDateString()}</p>
        <p>游玩平台：${game.platform}</p>
        <p>游玩日期：${new Date(game.playDate).toLocaleDateString()}</p>
        <p>评分：${game.rating}/10</p>
    `;
    document.getElementById('detailsReview').textContent = game.review;
    
    // 显示模态框
    modal.classList.add('active');
    
    // 编辑按钮事件
    editBtn.onclick = () => {
        showEditForm(game);
        modal.classList.remove('active');
    };
    
    // 关闭按钮事件
    const closeModal = () => {
        modal.classList.remove('active');
        closeBtn.removeEventListener('click', closeModal);
    };
    
    closeBtn.addEventListener('click', closeModal);
}

// 更新游戏列表显示
function updateGameList() {
    const games = getGames();
    const selectedYear = yearFilter.value;
    const selectedPlatform = platformFilter.value;
    
    // 筛选游戏
    const filteredGames = games.filter(game => {
        const gameYear = new Date(game.playDate).getFullYear().toString();
        const yearMatch = selectedYear === 'all' || gameYear === selectedYear;
        const platformMatch = selectedPlatform === 'all' || game.platform === selectedPlatform;
        return yearMatch && platformMatch;
    });
    
    // 清空并重新填充游戏网格
    gameGrid.innerHTML = '';
    filteredGames.forEach(game => {
        gameGrid.appendChild(createGameCard(game));
    });
}

// 更新筛选器选项
function updateFilters() {
    const games = getGames();
    const years = new Set();
    const platforms = new Set();
    
    games.forEach(game => {
        years.add(new Date(game.playDate).getFullYear().toString());
        platforms.add(game.platform);
    });
    
    // 更新年份筛选器
    const currentYearOption = yearFilter.value;
    yearFilter.innerHTML = '<option value="all">全部年份</option>';
    Array.from(years).sort().reverse().forEach(year => {
        yearFilter.innerHTML += `<option value="${year}" ${year === currentYearOption ? 'selected' : ''}>${year}年</option>`;
    });
    
    // 更新平台筛选器
    const currentPlatformOption = platformFilter.value;
    platformFilter.innerHTML = '<option value="all">全部平台</option>';
    Array.from(platforms).sort().forEach(platform => {
        platformFilter.innerHTML += `<option value="${platform}" ${platform === currentPlatformOption ? 'selected' : ''}>${platform}</option>`;
    });
}

// 监听筛选器变化
yearFilter.addEventListener('change', updateGameList);
platformFilter.addEventListener('change', updateGameList);

// 显示编辑表单
function showEditForm(game) {
    const editModal = document.getElementById('editGameModal');
    const editForm = document.getElementById('editGameForm');
    
    // 填充表单数据
    document.getElementById('editGameId').value = game.id;
    document.getElementById('editGameTitle').value = game.title;
    document.getElementById('editPlayDate').value = game.playDate;
    document.getElementById('editReleaseDate').value = game.releaseDate;
    document.getElementById('editPlatform').value = game.platform;
    document.getElementById('editRating').value = game.rating;
    document.getElementById('editReview').value = game.review;
    
    // 显示模态框
    editModal.classList.add('active');
    
    // 取消按钮事件
    editModal.querySelector('.cancel-btn').onclick = () => {
        editModal.classList.remove('active');
        editForm.reset();
    };
    
    // 表单提交事件
    editForm.onsubmit = async (e) => {
        e.preventDefault();
        
        const games = getGames();
        const gameIndex = games.findIndex(g => g.id === game.id);
        
        if (gameIndex === -1) return;
        
        // 更新游戏数据
        const updatedGame = {
            ...game,
            title: document.getElementById('editGameTitle').value,
            playDate: document.getElementById('editPlayDate').value,
            releaseDate: document.getElementById('editReleaseDate').value,
            platform: document.getElementById('editPlatform').value,
            rating: document.getElementById('editRating').value,
            review: document.getElementById('editReview').value
        };
        
        // 处理封面图片
        const coverFile = document.getElementById('editGameCover').files[0];
        if (coverFile) {
            const reader = new FileReader();
            updatedGame.cover = await new Promise((resolve) => {
                reader.onload = (e) => resolve(e.target.result);
                reader.readAsDataURL(coverFile);
            });
        }
        
        games[gameIndex] = updatedGame;
        saveGames(games);
        
        editModal.classList.remove('active');
        editForm.reset();
        updateGameList();
        updateFilters();
    };
}

// 初始化页面
updateGameList();
updateFilters();