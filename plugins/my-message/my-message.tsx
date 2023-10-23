import {
  ref,
  computed,
  render,
  createVNode,
  shallowReactive,
  defineComponent,
  onMounted
} from 'vue';
import { VIcon } from 'vuetify/components';
import { isClient } from '@vueuse/core';
import { 
  mdiInformation,
  mdiCheckCircle,
  mdiCloseCircle,
  mdiAlertCircle
} from '@mdi/js';
import '@/assets/style/components/my-message.scss';

import type { VNode, AppContext, App, ComponentInternalInstance } from 'vue';

const messageProps = {
  type: {
    type: String,
    default: 'info',
    required: false
  },
  message: {
    type: String,
    default: undefined,
  },
  onClose: {
    type: Function,
    default: undefined,
    required: false
  },
  id: {
    type: String,
    default: '',
    required: false
  }
};

export interface MessageOptions {
  type?: 'info' | 'success' | 'danger' | 'warn';
  message: string;
  onClose?: () => void
};

interface MessageHandler {
  close: () => void
};

export type MessageFn = {
  (options: MessageOptions, context: AppContext): MessageHandler
};

type MessageContext = {
  id: string;
  vNode: VNode;
  handler: MessageHandler;
  vm: ComponentInternalInstance,
  props: MessageProps
};

type MessageProps = typeof messageProps;

let seed = 1;
const instances: MessageContext[] = shallowReactive([]);

const getInstance = (id: string) => {
  const idx = instances.findIndex(instance => instance.id === id);
  const current = instances[idx];
  let prev: MessageContext | undefined;
  if(idx > 0) prev = instances[idx - 1];

  return { current, prev };
};

const getLastOffset = (id: string): number => {
  const { prev } = getInstance(id);

  if(!prev) return 10;
  return prev.vm.exposed!.bottom.value;
};

const closeMessage = (instance: MessageContext) => {
  const idx = instances.indexOf(instance);
  if(idx === -1) return;

  instances.splice(idx, 1);
  const { handler } = instance;
  handler.close();
};

const createMessage = (options: MessageOptions, context: AppContext) => {
  const id = `message_${seed++}`;
  const userOnClose = options.onClose;

  const container = document.createElement('div');

  const props = {
    ...options,
    id,
    onClose: () => {
      userOnClose?.();
      closeMessage(instance);
    },
    onDestroy: () => {render(null, container)}
  };

  const vNode = createVNode(
    MessageConstructor,
    props
  );
  vNode.appContext = context;

  render(vNode, container);
  document.body.appendChild(container.firstElementChild!);

  const vm = vNode.component!;
  
  const handler: MessageHandler = {
    close: () => { vm.exposed!.visible.value = false }
  };

  const instance: MessageContext = {
    id,
    vNode,
    vm,
    handler,
    props: (vNode.component as any).props
  };

  return instance;
};

const message: MessageFn = 
(
  options: MessageOptions,
  context: AppContext
) => {
  if(!isClient) return { close: () => undefined };

  const instance = createMessage(options, context);

  instances.push(instance);
  return instance.handler;
};

const MessageConstructor = defineComponent({
  name: 'MyMessage',
  props: messageProps,
  emits: { destroy: () => true },

  setup(props, { emit, expose }) {
    const defaultOffset = 5;
    const defaultHeight = 56;

    const visible = ref(false);
    const lastOffset = computed(() => getLastOffset(props.id));
    const offset = computed(() => defaultOffset + lastOffset.value);
    const bottom = computed((): number => defaultHeight + offset.value);

    const ICON_MAP: {
      [key: string]: string
    } = {
      info: mdiInformation,
      success: mdiCheckCircle,
      danger: mdiCloseCircle,
      warn: mdiAlertCircle
    };
    const COLOR_MAP: {
      [key: string]: string
    } = {
      info: '#1677ff',
      success: '#52c41a',
      danger: '#ff4d4f',
      warn: '#faad14'
    };

    let stopTimer: (() => void ) | undefined = undefined;

    const close = function() {
      visible.value = false;
    };

    const startTimer = () => {
      ({ stop: stopTimer } = useTimeoutFn(() => {
        if(visible.value) close();
        props.onClose?.();

        // destroy rendered element
        setTimeout(() => emit('destroy'), 300);
      }, 4000));
    };

    const clearTimer = () => stopTimer?.();

    onMounted(() => { 
      startTimer();
      visible.value = true;
    });

    expose({
      visible,
      bottom,
      close
    });

    return () => (
      <div
          class={`sv-my-message ${visible.value ? '' : 'leave'}`}
          role="alert"
          ref="messageRef"
          style={
            (visible.value ? 'display: block;' : '') +
            `top: ${offset.value}px`
          }
        >
          <div class="sv-my-message__container">
            <div class="sv-my-message__content">
              <VIcon class="sv-my-message__icon"
                icon={ ICON_MAP[props.type] } 
                color={ COLOR_MAP[props.type] }
              />
              <span>{ props.message }</span>
            </div>
          </div>
        </div>
    )
  }
});

export default message as MessageFn;