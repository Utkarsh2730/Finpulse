function overviewItem(claim, withAction) {
  const item = document.createElement('li');

  const top = document.createElement('div');
  top.className = 'claim-top';
  const title = document.createElement('span');
  title.className = 'claim-title';
  title.textContent = claim.title;
  const amount = document.createElement('span');
  amount.className = 'claim-amount';
  amount.textContent = money(claim.amount);
  top.appendChild(title);
  top.appendChild(amount);

  const meta = document.createElement('p');
  meta.className = 'claim-meta';
  meta.textContent = claim.code + ' · ' + shortDate(claim.date);

  item.appendChild(top);
  item.appendChild(meta);
  item.appendChild(makeBadge(claim.status));

  if (withAction && claim.status === 'draft') {
    const link = document.createElement('a');
    link.className = 'link';
    link.href = 'employee.html?draft=' + claim.id;
    link.textContent = 'Finish this draft';
    item.appendChild(link);
  }

  if (withAction && claim.status === 'rejected') {
    const note = document.createElement('p');
    note.className = 'claim-note';
    if (claim.reviewNote) {
      note.textContent = 'Manager note: "' + claim.reviewNote + '"';
    } else {
      note.textContent = 'Your manager rejected this claim.';
    }
    const link = document.createElement('a');
    link.className = 'link';
    link.href = 'employee.html';
    link.textContent = 'Submit a new claim';
    item.appendChild(note);
    item.appendChild(link);
  }

  return item;
}

function emptyItem(text) {
  const item = document.createElement('li');
  item.className = 'empty';
  item.textContent = text;
  return item;
}

async function startOverview(me) {
  const firstName = me.name.split(' ')[0];
  document.getElementById('greeting').textContent = 'Hi, ' + firstName;

  const claims = await getData('/claims');
  const attentionList = document.getElementById('attentionList');
  const activityList = document.getElementById('activityList');

  let pendingTotal = 0;
  let pendingCount = 0;
  let approvedTotal = 0;
  let approvedCount = 0;
  let attentionCount = 0;

  for (let i = 0; i < claims.length; i++) {
    const claim = claims[i];
    if (claim.status === 'pending') {
      pendingTotal = pendingTotal + claim.amount;
      pendingCount = pendingCount + 1;
    }
    if (claim.status === 'approved') {
      approvedTotal = approvedTotal + claim.amount;
      approvedCount = approvedCount + 1;
    }
    if (claim.status === 'draft' || claim.status === 'rejected') {
      attentionCount = attentionCount + 1;
      attentionList.appendChild(overviewItem(claim, true));
    }
  }

  let howMany = claims.length;
  if (howMany > 5) {
    howMany = 5;
  }
  for (let i = 0; i < howMany; i++) {
    activityList.appendChild(overviewItem(claims[i], false));
  }

  if (attentionCount === 0) {
    attentionList.appendChild(emptyItem('You are all caught up. Nothing needs your attention.'));
  }
  if (claims.length === 0) {
    activityList.appendChild(emptyItem('No claims yet. Your first one will show up here.'));
  }

  document.getElementById('pendingTotal').textContent = money(pendingTotal);
  document.getElementById('pendingCount').textContent = plural(pendingCount, 'claim') + ' in review';
  document.getElementById('approvedTotal').textContent = money(approvedTotal);
  document.getElementById('approvedCount').textContent = plural(approvedCount, 'claim') + ' approved';
  document.getElementById('attentionCount').textContent = attentionCount;
}
