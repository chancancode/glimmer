import EmberObject, { computed } from 'glimmer-object';
import { TestEnvironment, EmberishGlimmerComponent as EmberComponent } from 'glimmer-demos';

let ServerUptime = <any>EmberComponent.extend({
  upDays: computed(function() {
    return this.attrs.days.reduce((upDays, day) => {
      return upDays += (day.up ? 1 : 0);
    }, 0);
  }).property('attrs.days'),

  streak: computed(function() {
    let [max] = this.attrs.days.reduce(([max, streak], day) => {
      if (day.up && streak + 1 > max) {
        return [streak + 1, streak + 1];
      } else if (day.up) {
        return [max, streak + 1];
      } else {
        return [max, 0];
      }
    }, [0, 0]);

    return max;
  }).property('attrs.days')
});

let UptimeDay = <any>EmberComponent.extend({
  color: computed(function() {
    return this.attrs.day.up ? '#8cc665' : '#ccc';
  }).property('attrs.day.up'),

  memo: computed(function() {
    return this.attrs.day.up ? 'Servers operational!' : 'Red alert!';
  }).property('attrs.day.up'),

});

let env = new TestEnvironment();

env.registerEmberishGlimmerComponent('uptime-day', UptimeDay, `
  <div class="uptime-day">
    <span class="uptime-day-status" style="background-color: {{color}}" />
    <span class="hover">{{@day.number}}: {{memo}}</span>
  </div>
`);

env.registerEmberishGlimmerComponent('server-uptime', ServerUptime, `
  <div class="server-uptime">
  <h1>{{@name}}</h1>
  <h2>{{upDays}} Days Up</h2>
  <h2>Biggest Streak: {{streak}}</h2>

  <div class="days">
    {{#each @days key="day.number" as |day|}}
      <uptime-day day={{day}} />
    {{/each}}
  </div>
  </div>
`);

let app = env.compile(`
  {{#each servers key="name" as |server|}}
    <server-uptime name={{server.name}} days={{server.days}} />
  {{/each}}
`)

let clear;
let playing = false;

export function toggle() {
  if (playing) {
    window['playpause'].innerHTML = "Play";
    clearInterval(clear);
  } else {
    window['playpause'].innerHTML = "Pause";
    start();
    playing = true;
  }
}

function start() {
  let output = document.getElementById('output');

  console.time('rendering');
  env.begin();

  let result = app.render({ servers: servers() }, env, { appendTo: output });

  console.log(env['createdComponents'].length);
  env.commit();
  console.timeEnd('rendering');

  clear = setInterval(function() {
    result.self.update({ servers: servers() });
    console.time('updating');
    result.rerender();
    console.timeEnd('updating');
  }, 50);
}

function servers() {
  return [
    server("Stefan's Server"),
    server("Godfrey's Server"),
    server("Yehuda's Server"),
    server("Chad's Server"),
    server("Robert's Server 1"),
    server("Robert's Server 2"),
    server("Robert's Server 3"),
    server("Robert's Server 4"),
    server("Robert's Server 5"),
    server("Robert's Server 6")
  ];
}

function server(name: string) {
  let days = [];

  for (let i=0; i<=364; i++) {
    let up = Math.random() > 0.2;
    days.push({ number: i, up });
  }

  return { name, days };
}
