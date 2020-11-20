var child_process = require('child_process');
var app = require('express')();
var http = require('http').createServer(app);
var io = require('socket.io')(http);

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

function getRandomInt(max) {
  return Math.floor(Math.random() * Math.floor(max));
}
function escapeShellArg (arg) {
    return `'${arg.replace(/'/g, `'\\''`)}'`;
}

io.on('connection', (socket) => {
  socket.on('chat message', (msg) => {
    console.log('message: ' + msg);
    io.emit('chat message', '書き出し：' + msg);
    io.emit('chat message', '（´-`）.｡oO（「'+msg+'」の続きを書けばいいんか…)');
    try {
      // docker-compose exec app python gpt2-generate.py --model gpt2ja-medium --num_generate 1
      // std_out = child_process.execFileSync('docker-compose exec app python gpt2-generate.py --model gpt2ja-medium --num_generate 1', ['']);
      // std_out = child_process.execFileSync('docker-compose', ['exec','app','ls']);
      // std_out = child_process.execSync('docker-compose exec -T app /bin/sh -c "ls"')
      // std_out = child_process.execSync('docker-compose exec -T app python gpt2-generate.py --model gpt2ja-medium --num_generate 1');
      console.log('message start');
      var done = false;
      std_out = child_process.exec('docker-compose exec -T app python gpt2-generate.py --model gpt2ja-medium --num_generate=1 --context='+escapeShellArg(msg), (error, stdout, stderr) => {
        if(error) return console.error('ERROR', error);
        io.emit('chat message', '（´-`）.｡oO（書き上がったで…）' + "\n" + stdout.toString() + "\n" + '（´-`）.｡oO（次の書き出しは何や？）');
        io.emit('ready message', '（´-`）.｡oO（）');
        console.log('STDOUT', stdout);  // string
        console.log('STDERR', stderr);  // string
        console.log('message end');
        done = true;
      });
      var i = 0;
      function writingMessage() {
        msgs = [
          '（´-`）[書いています]',
          '（´-`）[鼻をかいています]',
          '（´-`）[書いたものを少し消しています]',
          '（´-`）[虚空を見つめています]',
          '（´-`）[悩んでいます]',
          '（´-`）[新展開を思いつきました]',
          '（´-`）[間違えました]',
          '（´-`）[左手で書いています]',
          '（´-`）[読み返しています]',
          '（´-`）[技名に悩んでいます]',
        ];
        i = i % msgs.length;
        if (!done) io.emit('chat message', msgs[i]);
        i++;

        if (!done) setTimeout(writingMessage, 10000);
      }
      setTimeout(writingMessage, 5000);
    } catch(error) {
      if (!error.stderr) {
        console.log('STDERR??')
      } else {
        console.log('STDERR', error.stderr.toString());
      }
    }
  });
});

http.listen(3000, () => {
  console.log('listening on *:3000');
});
