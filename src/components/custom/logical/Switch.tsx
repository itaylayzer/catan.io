import React, { ReactNode, Children, isValidElement, ReactElement } from 'react';

interface CaseProps {
  condition: boolean;
  children: ReactNode;
}

interface DefaultCaseProps {
  children: ReactNode;
}

interface SwitchProps {
  children: ReactNode;
}

/**
 * Main Switch Component
 */
const Switch = ({ children }: SwitchProps) => {
  let match: ReactNode = null;
  let defaultCase: ReactNode = null;

  Children.forEach(children, (child) => {
    if (!isValidElement(child)) return;

    if (!match && child.type === Switch.Case) {
      const { condition } = child.props as CaseProps;
      if (condition) {
        match = child;
      }
    } else if (child.type === Switch.DefaultCase) {
      defaultCase = child;
    }
  });

  return <>{match ?? defaultCase}</>;
};

// Assigning sub-components to the Switch namespace
Switch.Case = ({ children }: CaseProps) => <>{children}</>;
Switch.DefaultCase = ({ children }: DefaultCaseProps) => <>{children}</>;

export { Switch };