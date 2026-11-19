const assert = require('node:assert/strict');

const base = process.env.API_URL || 'http://localhost:3000';
async function request(path, options = {}, expected = 200) {
  const response = await fetch(base + path, options);
  const body = response.status === 204 ? null : await response.json();
  assert.equal(response.status, expected,
    path + ': expected ' + expected + ', got ' + response.status + ': ' + JSON.stringify(body));
  return body;
}

async function main() {
  await request('/', {}, 200);
  let id;
  try {
    const created = await request('/notes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'Bai 3 - kiem thu',
        content: 'MongoDB Atlas va Supabase',
        tags: ['cloud', 'nosql']
      })
    }, 201);
    id = created._id;
    assert.ok(id, 'POST phai tra ve _id');
    console.log('PASS POST /notes => 201');

    const one = await request('/notes/' + id);
    assert.equal(one.title, 'Bai 3 - kiem thu');
    await request('/notes?tag=nosql');
    console.log('PASS GET /notes, /notes/:id => 200');

    const updated = await request('/notes/' + id, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: 'Ghi chu da sua' })
    });
    assert.equal(updated.title, 'Ghi chu da sua');
    console.log('PASS PUT /notes/:id => 200');

    const form = new FormData();
    form.append('file', new Blob(['Tep thu\n'], { type: 'text/plain' }), 'note.txt');
    const attachment = await request('/notes/' + id + '/attachment', {
      method: 'POST',
      body: form
    });
    assert.ok(attachment.attachmentUrl, 'Phai tra ve attachmentUrl');
    const fileResponse = await fetch(attachment.attachmentUrl);
    assert.equal(fileResponse.status, 200, 'URL public phai mo duoc');
    console.log('PASS POST attachment => 200, public URL => 200');
    console.log('Attachment URL: ' + attachment.attachmentUrl);

    await request('/notes/invalid-id', {}, 400);
    await request('/notes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: 'Thieu title' })
    }, 400);
    console.log('PASS 400 voi ObjectId khong hop le / thieu title');
  } finally {
    if (id) {
      await request('/notes/' + id, { method: 'DELETE' }, 204);
      await request('/notes/' + id, {}, 404);
      console.log('PASS DELETE => 204, GET lai => 404');
    }
  }
  console.log('Tat ca kiem thu API da PASS.');
}

main().catch((err) => {
  console.error('SMOKE FAIL:', err.message);
  process.exitCode = 1;
});
