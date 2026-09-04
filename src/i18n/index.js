import { createI18n } from 'vue-banana-i18n'
import idMessages from './id.json'
import enMessages from './en.json'
import esMessages from './es.json'
import frMessages from './fr.json'
import gaMessages from './ga.json'
import glMessages from './gl.json'
import lbMessages from './lb.json'
import ltMessages from './lt.json'
import minMessages from './min.json'
import pplMessages from './ppl.json'
import nlMessages from './nl.json'
import pmsMessages from './pms.json'
import skMessages from './sk.json'
import svMessages from './sv.json'
import mkMessages from './mk.json'
import srecMessages from './sr-ec.json'
import heMessages from './he.json'
import psMessages from './ps.json'
import paMessages from './pa.json'
import zhhansMessages from './zh-hans.json'
import zhhantMessages from './zh-hant.json'
import koMessages from './ko.json'

import { DISPLAY_LANGUAGES, getBrowserLanguage } from './displayLanguages.js'

const messages = {
  id: idMessages,
  en: enMessages,
  es: esMessages,
  fr: frMessages,
  ga: gaMessages,
  gl: glMessages,
  lb: lbMessages,
  lt: ltMessages,
  min: minMessages,
  ppl: pplMessages,
  nl: nlMessages,
  pms: pmsMessages,
  sk: skMessages,
  sv: svMessages,
  mk: mkMessages,
  'sr-ec': srecMessages,
  he: heMessages,
  ps: psMessages,
  pa: paMessages,
  'zh-hans': zhhansMessages,
  'zh-hant':zhhantMessages,
  ko: koMessages,
};

export default createI18n({
  locale: localStorage?.getItem('locale') || getBrowserLanguage(),
  messages: messages
});
