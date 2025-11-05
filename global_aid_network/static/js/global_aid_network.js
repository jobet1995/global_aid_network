/**
 * Global Aid Network - Main JavaScript File
 * 
 * This file contains core functionality for the Global Aid Network website,
 * including AJAX utilities, API integration, and UI enhancements.
 */

(function($) {
    'use strict';

    // Global namespace for the application
    window.GlobalAidNetwork = {
        // API base URL - to be configured based on environment
        apiUrl: '/api/v1/',
        
        // CSRF token for Django
        csrfToken: $('meta[name="csrf-token"]').attr('content') || '',
        
        // Initialize the application
        init: function() {
            this.bindEvents();
            this.initializeComponents();
        },
        
        // Bind event listeners
        bindEvents: function() {
            // Document ready events
            $(document).ready(this.onDocumentReady.bind(this));
            
            // Form submissions
            $(document).on('submit', '.ajax-form', this.handleFormSubmission.bind(this));
            
            // Click events for AJAX actions
            $(document).on('click', '.ajax-action', this.handleAjaxAction.bind(this));
            
            // Load more functionality
            $(document).on('click', '.load-more', this.handleLoadMore.bind(this));
        },
        
        // Initialize UI components
        initializeComponents: function() {
            this.initializeTooltips();
            this.initializeModals();
            this.initializeAnimations();
        },
        
        // Document ready callback
        onDocumentReady: function() {
            console.log('Global Aid Network initialized');
            this.setupCSRF();
        },
        
        // Setup CSRF token for AJAX requests
        setupCSRF: function() {
            if (this.csrfToken) {
                $.ajaxSetup({
                    beforeSend: function(xhr, settings) {
                        if (!/^(GET|HEAD|OPTIONS|TRACE)$/i.test(settings.type) && !this.crossDomain) {
                            xhr.setRequestHeader("X-CSRFToken", GlobalAidNetwork.csrfToken);
                        }
                    }
                });
            }
        },
        
        // Handle form submissions via AJAX
        handleFormSubmission: function(event) {
            event.preventDefault();
            
            const $form = $(event.target);
            const url = $form.attr('action') || window.location.href;
            const method = $form.attr('method') || 'POST';
            
            // Show loading state
            this.showLoading($form.find('button[type="submit"]'));
            
            // Submit form data
            $.ajax({
                url: url,
                method: method,
                data: $form.serialize(),
                dataType: 'json'
            })
            .done(this.onFormSuccess.bind(this, $form))
            .fail(this.onFormError.bind(this, $form))
            .always(this.hideLoading.bind(this, $form.find('button[type="submit"]')));
        },
        
        // Handle AJAX actions (buttons, links, etc.)
        handleAjaxAction: function(event) {
            event.preventDefault();
            
            const $element = $(event.target);
            const url = $element.data('url');
            const method = $element.data('method') || 'GET';
            const confirmMessage = $element.data('confirm');
            
            // Confirmation dialog if specified
            if (confirmMessage && !confirm(confirmMessage)) {
                return;
            }
            
            // Show loading state
            this.showLoading($element);
            
            // Perform AJAX request
            $.ajax({
                url: url,
                method: method,
                dataType: 'json'
            })
            .done(this.onAjaxSuccess.bind(this, $element))
            .fail(this.onAjaxError.bind(this, $element))
            .always(this.hideLoading.bind(this, $element));
        },
        
        // Handle "Load More" functionality
        handleLoadMore: function(event) {
            event.preventDefault();
            
            const $button = $(event.target);
            const url = $button.data('url');
            const target = $button.data('target');
            const page = $button.data('page') || 1;
            
            // Show loading state
            this.showLoading($button);
            
            // Load more data
            $.ajax({
                url: url,
                method: 'GET',
                data: { page: page + 1 },
                dataType: 'json'
            })
            .done(this.onLoadMoreSuccess.bind(this, $button, target))
            .fail(this.onLoadMoreError.bind(this, $button))
            .always(this.hideLoading.bind(this, $button));
        },
        
        // Form submission success callback
        onFormSuccess: function($form, response) {
            // Handle different response types
            if (response.redirect) {
                window.location.href = response.redirect;
                return;
            }
            
            if (response.message) {
                this.showNotification(response.message, 'success');
            }
            
            if (response.resetForm) {
                $form[0].reset();
            }
            
            // Trigger custom event
            $form.trigger('form:success', [response]);
        },
        
        // Form submission error callback
        onFormError: function($form, xhr) {
            const response = xhr.responseJSON || {};
            const message = response.message || 'An error occurred while processing your request.';
            
            this.showNotification(message, 'error');
            
            // Handle field-specific errors
            if (response.errors) {
                this.displayFieldErrors($form, response.errors);
            }
            
            // Trigger custom event
            $form.trigger('form:error', [response]);
        },
        
        // AJAX action success callback
        onAjaxSuccess: function($element, response) {
            if (response.redirect) {
                window.location.href = response.redirect;
                return;
            }
            
            if (response.message) {
                this.showNotification(response.message, 'success');
            }
            
            if (response.refresh) {
                location.reload();
            }
            
            // Trigger custom event
            $element.trigger('ajax:success', [response]);
        },
        
        // AJAX action error callback
        onAjaxError: function($element, xhr) {
            const response = xhr.responseJSON || {};
            const message = response.message || 'An error occurred while processing your request.';
            
            this.showNotification(message, 'error');
            
            // Trigger custom event
            $element.trigger('ajax:error', [response]);
        },
        
        // Load more success callback
        onLoadMoreSuccess: function($button, target, response) {
            if (response.html) {
                $(target).append(response.html);
            }
            
            if (response.hasMore) {
                $button.data('page', response.page);
            } else {
                $button.hide();
            }
            
            // Trigger custom event
            $button.trigger('loadmore:success', [response]);
        },
        
        // Load more error callback
        onLoadMoreError: function($button, xhr) {
            const response = xhr.responseJSON || {};
            const message = response.message || 'Failed to load more items.';
            
            this.showNotification(message, 'error');
            
            // Trigger custom event
            $button.trigger('loadmore:error', [response]);
        },
        
        // Display field-specific errors
        displayFieldErrors: function($form, errors) {
            // Clear previous errors
            $form.find('.field-error').remove();
            $form.find('.error').removeClass('error');
            
            // Display new errors
            $.each(errors, function(field, messages) {
                const $field = $form.find('[name="' + field + '"]');
                const $container = $field.closest('.form-group');
                
                $container.addClass('error');
                $.each(messages, function(index, message) {
                    $container.append('<div class="field-error">' + message + '</div>');
                });
            });
        },
        
        // Show loading indicator
        showLoading: function($element) {
            $element.prop('disabled', true);
            $element.data('original-text', $element.html());
            $element.html('<span class="loading-spinner"></span> Loading...');
        },
        
        // Hide loading indicator
        hideLoading: function($element) {
            $element.prop('disabled', false);
            if ($element.data('original-text')) {
                $element.html($element.data('original-text'));
            }
        },
        
        // Show notification message
        showNotification: function(message, type) {
            // Create notification element if it doesn't exist
            if ($('#global-notification').length === 0) {
                $('body').append('<div id="global-notification" class="notification-container"></div>');
            }
            
            const $notification = $(
                '<div class="notification notification-' + type + '">' +
                '<span class="notification-message">' + message + '</span>' +
                '<button class="notification-close">&times;</button>' +
                '</div>'
            );
            
            $('#global-notification').append($notification);
            
            // Auto-hide after 5 seconds
            setTimeout(function() {
                $notification.fadeOut(function() {
                    $(this).remove();
                });
            }, 5000);
            
            // Close button handler
            $notification.find('.notification-close').on('click', function() {
                $notification.fadeOut(function() {
                    $(this).remove();
                });
            });
        },
        
        // API utility methods
        api: {
            // GET request
            get: function(endpoint, data, successCallback, errorCallback) {
                return $.ajax({
                    url: GlobalAidNetwork.apiUrl + endpoint,
                    method: 'GET',
                    data: data || {},
                    dataType: 'json'
                })
                .done(successCallback || function() {})
                .fail(errorCallback || function() {});
            },
            
            // POST request
            post: function(endpoint, data, successCallback, errorCallback) {
                return $.ajax({
                    url: GlobalAidNetwork.apiUrl + endpoint,
                    method: 'POST',
                    data: data || {},
                    dataType: 'json'
                })
                .done(successCallback || function() {})
                .fail(errorCallback || function() {});
            },
            
            // PUT request
            put: function(endpoint, data, successCallback, errorCallback) {
                return $.ajax({
                    url: GlobalAidNetwork.apiUrl + endpoint,
                    method: 'PUT',
                    data: data || {},
                    dataType: 'json'
                })
                .done(successCallback || function() {})
                .fail(errorCallback || function() {});
            },
            
            // DELETE request
            delete: function(endpoint, successCallback, errorCallback) {
                return $.ajax({
                    url: GlobalAidNetwork.apiUrl + endpoint,
                    method: 'DELETE',
                    dataType: 'json'
                })
                .done(successCallback || function() {})
                .fail(errorCallback || function() {});
            }
        },
        
        // UI Component initialization
        initializeTooltips: function() {
            // Initialize Bootstrap tooltips if available
            if ($.fn.tooltip) {
                $('[data-toggle="tooltip"]').tooltip();
            }
        },
        
        initializeModals: function() {
            // Initialize Bootstrap modals if available
            if ($.fn.modal) {
                $('[data-toggle="modal"]').modal();
            }
        },
        
        initializeAnimations: function() {
            // Smooth scrolling for anchor links
            $('a[href^="#"]').on('click', function(event) {
                const target = $(this.getAttribute('href'));
                if (target.length) {
                    event.preventDefault();
                    $('html, body').stop().animate({
                        scrollTop: target.offset().top
                    }, 1000);
                }
            });
            
            // Fade in elements on scroll
            $(window).on('scroll', function() {
                $('.fade-in-on-scroll').each(function() {
                    const $element = $(this);
                    const elementTop = $element.offset().top;
                    const windowHeight = $(window).height();
                    const scrollTop = $(window).scrollTop();
                    
                    if (elementTop < scrollTop + windowHeight - 100) {
                        $element.addClass('fade-in-visible');
                    }
                });
            });
            
            // Trigger scroll event on page load
            $(window).trigger('scroll');
        }
    };
    
    // Initialize the application when the document is ready
    $(document).ready(function() {
        GlobalAidNetwork.init();
    });
    
})(jQuery);