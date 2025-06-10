import { Fragment } from 'react';
import { Menu, Transition } from '@headlessui/react';

const positions = {
  'bottom-right': 'origin-top-right right-0',
  'bottom-left': 'origin-top-left left-0',
  'top-right': 'origin-bottom-right right-0 bottom-full mb-2',
  'top-left': 'origin-bottom-left left-0 bottom-full mb-2',
};

const Dropdown = ({
  trigger,
  items = [],
  position = 'bottom-right',
  className = '',
  itemClassName = '',
}) => {
  return (
    <Menu as="div" className="relative inline-block text-left">
      <Menu.Button as={Fragment}>{trigger}</Menu.Button>

      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items
          className={`
            absolute z-50 mt-2 w-56 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none
            ${positions[position]}
            ${className}
          `.trim()}
        >
          <div className="py-1">
            {items.map((item, index) => {
              if (item.divider) {
                return (
                  <div
                    key={`divider-${index}`}
                    className="my-1 border-t border-gray-100"
                  />
                );
              }

              return (
                <Menu.Item key={item.key || index}>
                  {({ active }) => {
                    const ItemComponent = item.href ? 'a' : 'button';
                    return (
                      <ItemComponent
                        {...(item.href ? { href: item.href } : { type: 'button' })}
                        className={`
                          ${
                            active
                              ? 'bg-gray-100 text-gray-900'
                              : 'text-gray-700'
                          }
                          group flex w-full items-center px-4 py-2 text-sm
                          disabled:opacity-50 disabled:cursor-not-allowed
                          ${item.className || itemClassName}
                        `.trim()}
                        onClick={item.onClick}
                        disabled={item.disabled}
                      >
                        {item.icon && (
                          <span className="mr-3 h-5 w-5" aria-hidden="true">
                            {item.icon}
                          </span>
                        )}
                        {item.label}
                      </ItemComponent>
                    );
                  }}
                </Menu.Item>
              );
            })}
          </div>
        </Menu.Items>
      </Transition>
    </Menu>
  );
};

export default Dropdown; 