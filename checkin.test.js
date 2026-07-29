// =============================================================
//  spanish-checkin 单元测试
//  从以下源文件中提取了纯逻辑函数进行测试（不修改原代码）：
//  - src/components/CheckinCard.jsx  → timeAgo()
//  - src/pages/LoginPage.jsx         → validate()
//  - src/pages/ProfilePage.jsx       → calculateStreak()
// =============================================================

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

// ──────────────────────────────────────────────
//  1. timeAgo() — 相对时间格式化
//  来源: src/components/CheckinCard.jsx (第5-19行)
//  与原版唯一的区别：加了 now 参数以便测试
// ──────────────────────────────────────────────
function timeAgo(dateStr, now = new Date()) {
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHour = Math.floor(diffMs / 3600000);
  const diffDay = Math.floor(diffMs / 86400000);

  if (diffMin < 1) return '刚刚';
  if (diffMin < 60) return `${diffMin} 分钟前`;
  if (diffHour < 24) return `${diffHour} 小时前`;
  if (diffDay === 1) return '昨天';
  if (diffDay < 7) return `${diffDay} 天前`;
  return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' });
}

// ──────────────────────────────────────────────
//  2. validate() — 登录/注册表单校验
//  来源: src/pages/LoginPage.jsx (第27-52行)
//  提取了校验规则，返回错误消息或 null（通过）
// ──────────────────────────────────────────────
function validate(values, isLogin) {
  if (!values.email) {
    return '请填写邮箱';
  }
  if (!values.password) {
    return '请填写密码';
  }
  if (values.password.length < 6) {
    return '密码至少需要 6 位';
  }
  if (!isLogin) {
    if (!values.username) {
      return '请填写用户名';
    }
    if (!values.nickname) {
      return '请填写昵称';
    }
  }
  return null; // 校验通过
}

// ──────────────────────────────────────────────
//  3. calculateStreak() — 连续打卡天数
//  来源: src/pages/ProfilePage.jsx (第36-57行)
//  提取了核心算法，接受日期数组和参考日期
// ──────────────────────────────────────────────
function calculateStreak(checkinDates, today = new Date()) {
  const t = new Date(today);
  t.setHours(0, 0, 0, 0);
  const dateSet = new Set(checkinDates);

  let streak = 0;
  const currentDate = new Date(t);

  // 如果今天没打卡，从昨天开始算
  if (!dateSet.has(currentDate.toISOString().split('T')[0])) {
    currentDate.setDate(currentDate.getDate() - 1);
  }

  while (true) {
    const dateStr = currentDate.toISOString().split('T')[0];
    if (dateSet.has(dateStr)) {
      streak++;
      currentDate.setDate(currentDate.getDate() - 1);
    } else {
      break;
    }
  }

  return streak;
}


// ═══════════════════════════════════════════════════
//  测 试 用 例
// ═══════════════════════════════════════════════════

// ── timeAgo 测试 ──
describe('timeAgo() — 相对时间格式化', () => {
  // 固定一个"现在"时间来保证测试结果可预测
  const NOW = new Date('2025-06-15T12:00:00Z');

  it('30秒前 → "刚刚"', () => {
    const d = new Date(NOW.getTime() - 30 * 1000).toISOString();
    assert.equal(timeAgo(d, NOW), '刚刚');
  });

  it('59秒前 → "刚刚"（边界：小于1分钟）', () => {
    const d = new Date(NOW.getTime() - 59 * 1000).toISOString();
    assert.equal(timeAgo(d, NOW), '刚刚');
  });

  it('5分钟前 → "5 分钟前"', () => {
    const d = new Date(NOW.getTime() - 5 * 60000).toISOString();
    assert.equal(timeAgo(d, NOW), '5 分钟前');
  });

  it('59分钟前 → "59 分钟前"（边界：小于1小时）', () => {
    const d = new Date(NOW.getTime() - 59 * 60000).toISOString();
    assert.equal(timeAgo(d, NOW), '59 分钟前');
  });

  it('3小时前 → "3 小时前"', () => {
    const d = new Date(NOW.getTime() - 3 * 3600000).toISOString();
    assert.equal(timeAgo(d, NOW), '3 小时前');
  });

  it('23小时前 → "23 小时前"（边界：小于1天）', () => {
    const d = new Date(NOW.getTime() - 23 * 3600000).toISOString();
    assert.equal(timeAgo(d, NOW), '23 小时前');
  });

  it('昨天 → "昨天"', () => {
    const d = new Date(NOW.getTime() - 25 * 3600000).toISOString();
    assert.equal(timeAgo(d, NOW), '昨天');
  });

  it('3天前 → "3 天前"', () => {
    const d = new Date(NOW.getTime() - 3 * 86400000).toISOString();
    assert.equal(timeAgo(d, NOW), '3 天前');
  });

  it('6天前 → "6 天前"（边界：小于7天）', () => {
    const d = new Date(NOW.getTime() - 6 * 86400000).toISOString();
    assert.equal(timeAgo(d, NOW), '6 天前');
  });

  it('10天前 → 格式化日期（如 "6月5日"）', () => {
    const d = new Date(NOW.getTime() - 10 * 86400000).toISOString();
    const result = timeAgo(d, NOW);
    // 10天前应该返回具体日期，不是相对时间
    assert.ok(!result.includes('天前'), '10天前不应该返回"天前"');
    assert.ok(!result.includes('小时前'), '10天前不应该返回"小时前"');
    assert.ok(!result.includes('刚刚'), '10天前不应该返回"刚刚"');
    assert.ok(!result.includes('昨天'), '10天前不应该返回"昨天"');
  });

  it('30天前 → 格式化日期', () => {
    const d = new Date(NOW.getTime() - 30 * 86400000).toISOString();
    const result = timeAgo(d, NOW);
    assert.ok(!result.includes('天前'));
    assert.ok(!result.includes('刚刚'));
  });

  it('空字符串输入 → 返回相对时间（这是原代码行为：new Date("") = Invalid Date，需确认）', () => {
    // 原代码没有对无效日期做防御处理，这里记录实际行为
    const d = new Date('').toISOString();
    // Invalid Date 的 getTime() 返回 NaN，所以 diffMs 为 NaN
    // Math.floor(NaN) = NaN，所有比较都为 false，会走到最后的 return
    // 这里我们只验证不会抛异常
    assert.doesNotThrow(() => timeAgo(d, NOW));
  });
});


// ── validate 测试 ──
describe('validate() — 登录/注册表单校验', () => {
  // 登录模式（isLogin = true）
  it('登录：全部正确 → 返回 null（通过）', () => {
    const v = { email: 'a@b.com', password: '123456' };
    assert.equal(validate(v, true), null);
  });

  it('登录：邮箱为空 → "请填写邮箱"', () => {
    const v = { email: '', password: '123456' };
    assert.equal(validate(v, true), '请填写邮箱');
  });

  it('登录：邮箱为纯空格 → "请填写邮箱"', () => {
    const v = { email: '   ', password: '123456' };
    // trim 在调用方 getValues() 中做了，这里模拟 trim 后的结果
    assert.equal(validate(v, true), '请填写邮箱');
  });

  it('登录：密码为空 → "请填写密码"', () => {
    const v = { email: 'a@b.com', password: '' };
    assert.equal(validate(v, true), '请填写密码');
  });

  it('登录：密码不到6位 → "密码至少需要 6 位"', () => {
    const v = { email: 'a@b.com', password: '12345' };
    assert.equal(validate(v, true), '密码至少需要 6 位');
  });

  it('登录：密码刚好6位 → 通过', () => {
    const v = { email: 'a@b.com', password: '123456' };
    assert.equal(validate(v, true), null);
  });

  // 注册模式（isLogin = false）
  it('注册：全部正确 → 返回 null（通过）', () => {
    const v = { email: 'a@b.com', password: '123456', username: 'xiaomei', nickname: '小美' };
    assert.equal(validate(v, false), null);
  });

  it('注册：缺少用户名 → "请填写用户名"', () => {
    const v = { email: 'a@b.com', password: '123456', username: '', nickname: '小美' };
    assert.equal(validate(v, false), '请填写用户名');
  });

  it('注册：缺少昵称 → "请填写昵称"', () => {
    const v = { email: 'a@b.com', password: '123456', username: 'xiaomei', nickname: '' };
    assert.equal(validate(v, false), '请填写昵称');
  });

  it('注册：检查顺序——先报邮箱错，再报密码错', () => {
    // 邮箱为空时，即使密码也空，应该先报邮箱的错
    const v = { email: '', password: '', username: '', nickname: '' };
    assert.equal(validate(v, false), '请填写邮箱');
  });

  it('注册：邮箱密码都对，才检查用户名昵称', () => {
    // 这个场景验证注册专属字段是在基本校验之后
    const v = { email: 'a@b.com', password: '123456', username: '', nickname: '' };
    assert.equal(validate(v, false), '请填写用户名');
  });
});


// ── calculateStreak 测试 ──
describe('calculateStreak() — 连续打卡天数', () => {
  const TODAY = new Date('2025-06-15T12:00:00Z');

  function d(offset) {
    const date = new Date(TODAY);
    date.setDate(date.getDate() + offset);
    return date.toISOString().split('T')[0];
  }

  it('今天打卡了 → 连续1天', () => {
    assert.equal(calculateStreak([d(0)], TODAY), 1);
  });

  it('今天没打卡，昨天打卡了 → 连续1天', () => {
    assert.equal(calculateStreak([d(-1)], TODAY), 1);
  });

  it('连续3天（今天也打了）→ 连续3天', () => {
    assert.equal(calculateStreak([d(0), d(-1), d(-2)], TODAY), 3);
  });

  it('连续7天（今天没打，从昨天往前7天）→ 连续7天', () => {
    const dates = [];
    for (let i = -1; i >= -7; i--) {
      dates.push(d(i));
    }
    assert.equal(calculateStreak(dates, TODAY), 7);
  });

  it('中间断了一天 → 只算到断开那天为止', () => {
    // 昨天打了，前天没打，大前天打了 → 只算1天
    assert.equal(calculateStreak([d(-1), d(-3)], TODAY), 1);
  });

  it('完全没有打卡记录 → 连续0天', () => {
    assert.equal(calculateStreak([], TODAY), 0);
  });

  it('今天没打卡、昨天也没打卡 → 连续0天', () => {
    assert.equal(calculateStreak([d(-2)], TODAY), 0);
  });

  it('只打了今天 → 连续1天（边界）', () => {
    assert.equal(calculateStreak([d(0)], TODAY), 1);
  });

  it('有重复日期的记录不影响结果', () => {
    // 同一天多条记录
    assert.equal(calculateStreak([d(0), d(0), d(-1), d(-1)], TODAY), 2);
  });
});
