const open = require("open");
const axios = require("axios");
const { format, add } = require("date-fns");
const notifier = require("node-notifier");

const rateLimit = 1000 * 2;

function log(...msg) {
  console.log(new Date().toISOString(), ...msg);
}

function error(msg) {
  console.error(new Date().toISOString(), msg);
}

function updateLinkDate(link) {
  return link.replace(/\d{4}-\d{2}-\d{2}/, format(new Date(), "yyyy-MM-dd"));
}

function updateLinkDatePfizer(link) {
  return link.replace(
    /\d{4}-\d{2}-\d{2}/,
    format(add(new Date(), { days: 42 }), "yyyy-MM-dd")
  );
}

async function hasSuitableDate(data, xhrLink) {
  try {
    if (data?.total) {
      log("More than 0 availabilities");
    }

    if (data?.next_slot?.startsWith("2021-06") || data?.next_slot?.startsWith("2021-07") || data?.next_slot?.startsWith("2021-08")) {
      const newData = (
        await axios.get(xhrLink.replace(/\d{4}-\d{2}-\d{2}/, data.next_slot))
      ).data;

      log("further checking for specific later date", xhrLink);

      for (availability of newData.availabilities) {
        if (availability.slots.length > 0) {
          log("More than one slot when requesting for new Date");
          return true;
        }
      }
    }
    if (data?.availabilities?.length) {
      for (availability of data.availabilities) {
        if (availability.slots.length > 0) {
          log("More than one slot");
          return true;
        }
      }
    }
  } catch (e) {
    throw e;
  }
  return false;
}

function sendSlack(bookingLink, vaccine) {
  axios
  .post(process.env.SLACK_TOKEN, {
    text: '@here: Impftermin (' + vaccine + ') ' + bookingLink
  })
  .then(res => {
    console.log(`statusCode: ${res.statusCode}`)
    console.log(res)
  })
  .catch(error => {
    console.error(error)
  })
}
function notify() {
  console.log("\u0007");

  notifier.notify({
    title: "Vacination",
    message: "Appointment!",
  });
}

function observe(xhrLink, bookingLink, vaccine) {
  function reschedule(time) {
    setTimeout(function () {
      observe(xhrLink, bookingLink, vaccine);
    }, Math.ceil(time || Math.random() * 1000));
  }

  log("checking directly");
  axios
    .get(updateLinkDate(xhrLink))
    .then(async function (response) {
      try {
        const isSuitable = await hasSuitableDate(
          response?.data,
          xhrLink
        );
        if (isSuitable) {
          log("direct success", response.data, bookingLink, vaccine);

          sendSlack(bookingLink, vaccine);

          notify();

          // 2 Minutes break
          reschedule(1000 * 60 * 2);

          return;
        }
      } catch (e) {
        error(e);
      }
      reschedule(rateLimit);
    })
    .catch(function (e) {
      error(e);
      reschedule(rateLimit);
    });
}

const data = [
  /*
    Comment back in the places you want to be checked

    bookingLink: the doctolib link where a human can book an appointment
    xhrLink: the link to doctolib's api where booking availabilty gets checked.
             You can find this link in the debugger console of your browser. The date will get automatically corrected to the current date

    secondShotXhrLink: Some places want you to book a second shoot immediatly, if they don't have a slot for a second appointment, you can't book at all.
                       So in this cases it makes sense to check this second appointment as well
  */
  {
    vaccine: "biontech",
    xhrLink: `https://www.doctolib.de/availabilities.json?start_date=2021-06-26&visit_motive_ids=2928202&agenda_ids=493073&insurance_sector=public&practice_ids=192701&destroy_temporary=true&limit=3`,
    bookingLink: `https://www.doctolib.de/medizinisches-versorgungszentrum-mvz/herzogenaurach/herzodoc-mvz-gmbh?insurance_sector=public`,
  },
  // {
  //   vaccine: "astrazeneca",
  //   xhrLink: `https://www.doctolib.de/availabilities.json?start_date=2021-06-26&visit_motive_ids=2928204&agenda_ids=493095&insurance_sector=public&practice_ids=192701&destroy_temporary=true&limit=3`,
  //   bookingLink: `https://www.doctolib.de/medizinisches-versorgungszentrum-mvz/herzogenaurach/herzodoc-mvz-gmbh?insurance_sector=public`,
  // },
  {
    vaccine: "biontech",
    xhrLink: `https://www.doctolib.de/availabilities.json?start_date=2021-06-26&visit_motive_ids=2827555&agenda_ids=479814&insurance_sector=public&practice_ids=153050&destroy_temporary=true&limit=3`,
    bookingLink: `https://www.doctolib.de/augenheilkunde/erlangen/konstantinos-plantzas?insurance_sector=public`,
  },
  // {
  //   vaccine: "astrazeneca",
  //   xhrLink: `https://www.doctolib.de/availabilities.json?start_date=2021-06-26&visit_motive_ids=2800353&agenda_ids=458466&insurance_sector=public&practice_ids=138595&destroy_temporary=true&limit=3`,
  //   bookingLink: `https://www.doctolib.de/gemeinschaftspraxis/herzogenaurach/praxis-dr-bucher?insurance_sector=public`,
  // },
  {
    vaccine: "biontech",
    xhrLink: `https://www.doctolib.de/availabilities.json?start_date=2021-06-26&visit_motive_ids=2748625&agenda_ids=450536&insurance_sector=public&practice_ids=164584&destroy_temporary=true&limit=3`,
    bookingLink: `https://www.doctolib.de/gemeinschaftspraxis/erlangen/hausarztzentrum-erlangen-dr-elvira-plogsties-dr-jessica-muenchmeyer?insurance_sector=public`,
  },
  {
    vaccine: "biontech",
    xhrLink: `https://www.doctolib.de/availabilities.json?start_date=2021-06-26&visit_motive_ids=2956954&agenda_ids=491035&insurance_sector=public&practice_ids=194378&destroy_temporary=true&limit=3`,
    bookingLink: `https://www.doctolib.de/praxis/langenzenn/hausarztpraxis-dr-med-r-froschauer?insurance_sector=public`,
  },
  {
    vaccine: "biontech",
    xhrLink: `https://www.doctolib.de/availabilities.json?start_date=2021-06-26&visit_motive_ids=2760323&agenda_ids=455984&insurance_sector=public&practice_ids=119042&destroy_temporary=true&limit=3`,
    bookingLink: `https://www.doctolib.de/praxis/nuernberg/hno-praxis-kollert-und-kollegen?insurance_sector=public`,
  },
  {
    vaccine: "biontech",
    xhrLink: `https://www.doctolib.de/availabilities.json?start_date=2021-06-26&visit_motive_ids=2836443&agenda_ids=478148&insurance_sector=public&practice_ids=190581&destroy_temporary=true&limit=3`,
    bookingLink: `https://www.doctolib.de/medizinisches-versorgungszentrum-mvz/nuernberg/mvz-dr-renard-kollegen?insurance_sector=public&pid=practice-190581`,
  },
  {
    vaccine: "biontech",
    xhrLink: `https://www.doctolib.de/availabilities.json?start_date=2021-06-26&visit_motive_ids=2778798&agenda_ids=458671&insurance_sector=public&practice_ids=133958&destroy_temporary=true&limit=3`,
    bookingLink: `https://www.doctolib.de/praxis/hersbruck/die-kinderaerzte-hersbruck?insurance_sector=public`,
  },
  {
    vaccine: "biontech",
    xhrLink: `https://www.doctolib.de/availabilities.json?start_date=2021-06-26&visit_motive_ids=2790071&agenda_ids=460985&insurance_sector=public&practice_ids=154127&destroy_temporary=true&limit=3`,
    bookingLink: `https://www.doctolib.de/gemeinschaftspraxis/ansbach/hautaerzte-bahnhofstrasse-dr-merk?pid=practice-154127`,
  },

];

data.forEach(function (links) {
  observe(links.xhrLink, links.bookingLink, links.vaccine);
});

log("Started checking periodically...");
log(
  "Just keep it running, it will send a slack message when an appointment opens up"
);
