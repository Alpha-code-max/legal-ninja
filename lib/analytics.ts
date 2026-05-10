import mixpanel from "mixpanel-browser";

const TOKEN = process.env.NEXT_PUBLIC_MIXPANEL_TOKEN ?? "";

export const analytics = {
  init: () => {
    if (TOKEN) {
      mixpanel.init(TOKEN, { persistence: "localStorage" });
    }
  },

  identify: (uid: string, props?: Record<string, any>) => {
    if (TOKEN) {
      mixpanel.identify(uid);
      if (props) {
        mixpanel.people.set(props);
      }
    }
  },

  track: (event: string, props?: Record<string, any>) => {
    if (TOKEN) {
      mixpanel.track(event, props);
    }
  },

  reset: () => {
    if (TOKEN) {
      mixpanel.reset();
    }
  },
};
