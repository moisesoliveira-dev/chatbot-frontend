'use client';

import React from 'react';
import { clsx } from 'clsx';

interface SwitchProps {
    checked?: boolean;
    defaultChecked?: boolean;
    onCheckedChange?: (checked: boolean) => void;
    disabled?: boolean;
    size?: 'sm' | 'md' | 'lg';
    color?: 'blue' | 'green' | 'purple' | 'red';
    label?: string;
    description?: string;
    className?: string;
    name?: string;
    id?: string;
}

export const Switch: React.FC<SwitchProps> = ({
    checked,
    defaultChecked = false,
    onCheckedChange,
    disabled = false,
    size = 'md',
    color = 'blue',
    label,
    description,
    className,
    name,
    id,
}) => {
    const [isChecked, setIsChecked] = React.useState(checked ?? defaultChecked);

    React.useEffect(() => {
        if (checked !== undefined) {
            setIsChecked(checked);
        }
    }, [checked]);

    const handleToggle = () => {
        if (disabled) return;

        const newValue = !isChecked;
        setIsChecked(newValue);
        onCheckedChange?.(newValue);
    };

    const handleKeyDown = (event: React.KeyboardEvent) => {
        if (disabled) return;

        if (event.key === ' ' || event.key === 'Enter') {
            event.preventDefault();
            handleToggle();
        }
    };

    const sizeStyles = {
        sm: {
            switch: 'w-8 h-4',
            thumb: 'w-3 h-3',
            translate: 'translate-x-4'
        },
        md: {
            switch: 'w-11 h-6',
            thumb: 'w-5 h-5',
            translate: 'translate-x-5'
        },
        lg: {
            switch: 'w-14 h-8',
            thumb: 'w-7 h-7',
            translate: 'translate-x-6'
        }
    };

    const colorStyles = {
        blue: {
            on: 'bg-blue-600',
            focus: 'focus:ring-blue-500'
        },
        green: {
            on: 'bg-green-600',
            focus: 'focus:ring-green-500'
        },
        purple: {
            on: 'bg-purple-600',
            focus: 'focus:ring-purple-500'
        },
        red: {
            on: 'bg-red-600',
            focus: 'focus:ring-red-500'
        }
    };

    const switchElement = (
        <button
            type="button"
            role="switch"
            aria-checked={isChecked}
            aria-labelledby={label && id ? `${id}-label` : undefined}
            aria-describedby={description && id ? `${id}-description` : undefined}
            disabled={disabled}
            onClick={handleToggle}
            onKeyDown={handleKeyDown}
            className={clsx(
                'relative inline-flex items-center rounded-full border-2 border-transparent',
                'transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2',
                sizeStyles[size].switch,
                {
                    [colorStyles[color].on]: isChecked && !disabled,
                    'bg-gray-200': !isChecked && !disabled,
                    'bg-gray-100 cursor-not-allowed': disabled,
                    [colorStyles[color].focus]: !disabled,
                },
                className
            )}
        >
            <span
                className={clsx(
                    'pointer-events-none inline-block rounded-full bg-white shadow-lg ring-0',
                    'transition-transform duration-200 ease-in-out',
                    sizeStyles[size].thumb,
                    {
                        [sizeStyles[size].translate]: isChecked,
                        'translate-x-0': !isChecked,
                    }
                )}
            />
        </button>
    );

    // Hidden input for form submission
    const hiddenInput = (
        <input
            type="hidden"
            name={name}
            value={isChecked ? 'true' : 'false'}
        />
    );

    if (label || description) {
        return (
            <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 mt-1">
                    {switchElement}
                    {hiddenInput}
                </div>
                <div className="flex-1">
                    {label && (
                        <label
                            id={id ? `${id}-label` : undefined}
                            className={clsx(
                                'block text-sm font-medium',
                                {
                                    'text-gray-900': !disabled,
                                    'text-gray-400': disabled,
                                    'cursor-pointer': !disabled,
                                    'cursor-not-allowed': disabled,
                                }
                            )}
                            onClick={!disabled ? handleToggle : undefined}
                        >
                            {label}
                        </label>
                    )}
                    {description && (
                        <p
                            id={id ? `${id}-description` : undefined}
                            className={clsx(
                                'text-sm',
                                {
                                    'text-gray-500': !disabled,
                                    'text-gray-400': disabled,
                                }
                            )}
                        >
                            {description}
                        </p>
                    )}
                </div>
            </div>
        );
    }

    return (
        <>
            {switchElement}
            {hiddenInput}
        </>
    );
};
